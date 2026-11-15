import { describe, it, expect } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  MAX_ARRAY_ITEMS,
  MAX_ITEM_CHARS,
  PersistentRateLimiter,
  deriveRateLimitKey,
  finalizeAndVerifyGeneratedMeal,
  getIngredientBoundsForEffort,
  normalizeGenerationRequest,
  validateStringArrayInput,
} from "../serverLogic";
import { createProfileForEnvironment } from "../src/utils/kitchenProfile";

describe("Server API Validation, Effort Bounds & Persistent Rate Limiter", () => {
  it("validates and caps string array inputs at 25 items and 100 chars", () => {
    expect(validateStringArrayInput(["ok", 123] as unknown)).toEqual({ ok: false });
    expect(validateStringArrayInput("not-array" as unknown)).toEqual({ ok: false });

    const longInput = Array.from({ length: 40 }, (_, i) => `${"x".repeat(130)}_${i}`);
    const parsed = validateStringArrayInput(longInput);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.items).toHaveLength(MAX_ARRAY_ITEMS);
      expect(parsed.items[0].length).toBe(MAX_ITEM_CHARS);
    }
  });

  it("scales AI ingredient count bounds cleanly per effort level", () => {
    expect(getIngredientBoundsForEffort("very_low").min).toBe(2);
    expect(getIngredientBoundsForEffort("very_low").max).toBe(5);
    expect(getIngredientBoundsForEffort("low").min).toBe(3);
    expect(getIngredientBoundsForEffort("low").max).toBe(7);
    expect(getIngredientBoundsForEffort("moderate").min).toBe(4);
    expect(getIngredientBoundsForEffort("moderate").max).toBe(9);
    expect(getIngredientBoundsForEffort("normal").max).toBe(14);
  });

  it("normalizes kitchenProfile independently of legacy fields", () => {
    const parsed = normalizeGenerationRequest({
      kitchenProfile: {
        environment: "microwave_only",
        equipment: ["microwave"],
        hasFreezer: false,
        effort: "moderate",
        varietyPreference: "familiar",
        dietaryRestrictions: ["vegetarian"],
      },
      pantryItems: ["Black beans", "Rice pouch"],
      mealType: "dinner",
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.profile.environment).toBe("microwave_only");
      expect(parsed.value.profile.effort).toBe("moderate");
      expect(parsed.value.mealType).toBe("dinner");
      expect(parsed.value.pantryItems).toEqual(["Black beans", "Rice pouch"]);
    }
  });

  it("rejects AI meals using disallowed hardware and deterministically fixes owned/missing ingredients", () => {
    const microProfile = createProfileForEnvironment("microwave_only", { effort: "low" });

    // AI hallucinated a stovetop skillet step for a microwave-only user -> must reject (null)
    const badStoveMeal = finalizeAndVerifyGeneratedMeal(
      {
        title: "Skillet Taco Beef",
        tagline: "Pan dish",
        prepMinutes: 5,
        cookMinutes: 10,
        ingredients: [{ item: "Ground beef", amount: "1 lb", walmartAisle: "Meat & Deli" }],
        instructions: [
          { stepNumber: 1, title: "Sear", instruction: "Heat a skillet over medium heat on stovetop." },
        ],
        whyItWorks: "Fast",
        rutAlternativeNote: "Good",
      },
      microProfile,
      ["Ground turkey"],
      "microwave"
    );
    expect(badStoveMeal).toBeNull();

    // Valid microwave meal: AI claimed Ground beef was owned because user had Ground turkey -> fix!
    const validMicroMeal = finalizeAndVerifyGeneratedMeal(
      {
        title: "Microwave Bean & Rice Chili Bowl",
        tagline: "Hot shelf-stable bowl",
        prepMinutes: 2,
        cookMinutes: 3,
        ingredients: [
          { item: "Brown rice", amount: "1 pouch", walmartAisle: "Pantry / Canned" },
          { item: "Black beans", amount: "1 can", walmartAisle: "Pantry / Canned" },
          { item: "Ground beef chili", amount: "1 can", walmartAisle: "Pantry / Canned" },
          { item: "Salsa", amount: "1/4 cup", walmartAisle: "Pantry / Canned" },
        ],
        instructions: [
          { stepNumber: 1, title: "Warm", instruction: "Microwave all items 2 minutes in a bowl." },
        ],
        ownedIngredients: ["Ground beef chili"],
        whyItWorks: "Shelf-stable",
        rutAlternativeNote: "Hearty",
      },
      microProfile,
      ["Ground turkey", "Jasmine rice", "Salsa"],
      "microwave"
    );

    expect(validMicroMeal).not.toBeNull();
    // Salsa is exact owned; Jasmine rice is substitution for Brown rice; Ground turkey is NOT Ground beef!
    expect(validMicroMeal!.ownedIngredients).toContain("Salsa");
    expect(validMicroMeal!.missingIngredients).toContain("Black beans");
    expect(validMicroMeal!.missingIngredients).toContain("Ground beef chili");
    expect(validMicroMeal!.possibleSubstitutions?.some((s) => s.includes("Jasmine rice"))).toBe(true);
  });

  it("persists rate limit counts to disk across limiter instances and enforces 20 req/10min", () => {
    const tmpFile = path.join(os.tmpdir(), `sc-rl-test-${Date.now()}-${Math.random()}.json`);
    try {
      const limiter1 = new PersistentRateLimiter({ filePath: tmpFile, maxRequests: 20 });
      const key = deriveRateLimitKey({ reqIp: "10.0.0.5", userIdHeader: "dorm_user_1" });
      expect(key).toBe("uid:dorm_user_1:10.0.0.5");

      const now = Date.now();
      for (let i = 0; i < 19; i++) {
        expect(limiter1.checkAndConsume(key, now + i).allowed).toBe(true);
      }

      // Simulate server restart by instantiating a brand new PersistentRateLimiter reading same file
      const limiter2 = new PersistentRateLimiter({ filePath: tmpFile, maxRequests: 20 });
      expect(limiter2.checkAndConsume(key, now + 20).allowed).toBe(true);
      const blocked = limiter2.checkAndConsume(key, now + 21);
      expect(blocked.allowed).toBe(false);
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  });
});
