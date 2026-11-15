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

  it("normalizes kitchenProfile livingSituation, dormConstraints, sharedKitchen, and otherEquipmentLabel", () => {
    const parsed = normalizeGenerationRequest({
      kitchenProfile: {
        environment: "custom",
        equipment: ["microwave", "other"],
        otherEquipmentLabel: "Rice Cooker",
        hasFreezer: false,
        effort: "moderate",
        varietyPreference: "familiar",
        dietaryRestrictions: ["vegetarian"],
        livingSituation: "dorm",
        sharedKitchen: "available_avoid",
        dormConstraints: {
          minimalCookware: true,
          preferShelfStable: true,
        },
      },
      pantryItems: ["Black beans", "Rice pouch"],
      mealType: "dinner",
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.profile.environment).toBe("custom");
      expect(parsed.value.profile.equipment).toContain("other");
      expect(parsed.value.profile.otherEquipmentLabel).toBe("Rice Cooker");
      expect(parsed.value.profile.livingSituation).toBe("dorm");
      expect(parsed.value.profile.sharedKitchen).toBe("available_avoid");
      expect(parsed.value.profile.dormConstraints?.minimalCookware).toBe(true);
    }
  });

  it("rejects AI meals requiring a colander/heavy cookware when dorm minimalCookware is active", () => {
    const dormProfile = createProfileForEnvironment("microwave_mini_fridge", {
      effort: "low",
      livingSituation: "dorm",
      sharedKitchen: "available_avoid",
      dormConstraints: {
        limitedFridgeSpace: true,
        limitedFreezerSpace: true,
        limitedFoodStorage: true,
        limitedCounterSpace: true,
        sharedAppliances: true,
        minimalCookware: true,
        preferShelfStable: true,
        smallerQuantities: true,
      },
    });

    const badColanderMeal = finalizeAndVerifyGeneratedMeal(
      {
        title: "Microwave Pasta With Colander Drain",
        tagline: "Needs strainer",
        prepMinutes: 2,
        cookMinutes: 6,
        ingredients: [{ item: "Penne pasta", amount: "1 cup", walmartAisle: "Pantry / Canned" }],
        instructions: [
          { stepNumber: 1, title: "Drain", instruction: "Microwave in water and drain in a colander." },
        ],
        whyItWorks: "Fast",
        rutAlternativeNote: "Good",
      },
      dormProfile,
      [],
      "microwave"
    );

    expect(badColanderMeal).toBeNull();
  });

  it("persists rate limit counts to disk across limiter instances and enforces non-bypassable IP limit", () => {
    const tmpFile = path.join(os.tmpdir(), `sc-rl-test-${Date.now()}-${Math.random()}.json`);
    try {
      const limiter1 = new PersistentRateLimiter({ filePath: tmpFile, maxRequests: 20 });
      const key1 = deriveRateLimitKey({ reqIp: "10.0.0.5", userIdHeader: "dorm_user_1" });
      const key2 = deriveRateLimitKey({ reqIp: "10.0.0.5", userIdHeader: "attacker_rotated_id" });
      expect(key1).toBe("ip:10.0.0.5");
      expect(key2).toBe("ip:10.0.0.5");

      const now = Date.now();
      for (let i = 0; i < 19; i++) {
        expect(limiter1.checkAndConsume(key1, now + i).allowed).toBe(true);
      }

      // Simulate server restart by instantiating a brand new PersistentRateLimiter reading same file
      const limiter2 = new PersistentRateLimiter({ filePath: tmpFile, maxRequests: 20 });
      expect(limiter2.checkAndConsume(key2, now + 20).allowed).toBe(true);
      const blocked = limiter2.checkAndConsume(key2, now + 21);
      expect(blocked.allowed).toBe(false);
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  });
});
