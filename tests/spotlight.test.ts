import { describe, it, expect } from "vitest";
import { DEFAULT_MEALS } from "../src/data/defaultMeals";
import { createProfileForEnvironment } from "../src/utils/kitchenProfile";
import { selectSpotlightMeal } from "../src/utils/spotlight";

describe("Adaptive Spotlight Selection Engine", () => {
  it("immediately switches away from an incompatible meal when environment or effort changes", () => {
    const fullNormal = createProfileForEnvironment("full_kitchen", { effort: "normal" });
    const firstRes = selectSpotlightMeal({
      meals: DEFAULT_MEALS,
      profile: fullNormal,
      lessFrequentList: [],
      pantryItems: [],
      recentSpotlightIds: [],
    });

    expect(firstRes.meal).not.toBeNull();
    const fullCookId = firstRes.meal!.id;

    // Now switch to Microwave Only + Very Low effort
    const microVeryLow = createProfileForEnvironment("microwave_only", { effort: "very_low" });
    const nextRes = selectSpotlightMeal({
      meals: DEFAULT_MEALS,
      profile: microVeryLow,
      lessFrequentList: [],
      pantryItems: [],
      recentSpotlightIds: firstRes.updatedRecentIds,
      currentSpotlightId: fullCookId,
      forceNewPick: false,
    });

    expect(nextRes.meal).not.toBeNull();
    expect(nextRes.meal!.id).not.toBe(fullCookId);
    expect(nextRes.meal!.requiredEquipment).not.toContain("stove");
    expect(nextRes.meal!.requiredEquipment).not.toContain("oven");
  });

  it("cycles through all eligible meals without repeating until the pool is exhausted", () => {
    const microOnlyLow = createProfileForEnvironment("microwave_only", { effort: "low" });
    const seenIds: string[] = [];
    let recent: string[] = [];
    let currentId: string | null = null;

    const initial = selectSpotlightMeal({
      meals: DEFAULT_MEALS,
      profile: microOnlyLow,
      lessFrequentList: [],
      pantryItems: [],
      recentSpotlightIds: [],
    });

    expect(initial.meal).not.toBeNull();
    const poolSize = initial.eligiblePoolCount;
    expect(poolSize).toBeGreaterThanOrEqual(2);

    seenIds.push(initial.meal!.id);
    recent = initial.updatedRecentIds;
    currentId = initial.meal!.id;

    for (let i = 1; i < poolSize; i++) {
      const next = selectSpotlightMeal({
        meals: DEFAULT_MEALS,
        profile: microOnlyLow,
        lessFrequentList: [],
        pantryItems: [],
        recentSpotlightIds: recent,
        currentSpotlightId: currentId,
        forceNewPick: true,
      });
      expect(next.meal).not.toBeNull();
      expect(seenIds).not.toContain(next.meal!.id);
      seenIds.push(next.meal!.id);
      recent = next.updatedRecentIds;
      currentId = next.meal!.id;
    }

    expect(new Set(seenIds).size).toBe(poolSize);
  });

  it("returns an explicit emptyReason and helpful 1-click adjustments when no meals match", () => {
    const impossibleProfile = createProfileForEnvironment("microwave_only", {
      effort: "normal",
      dietaryRestrictions: ["dairy_free", "gluten_free", "vegetarian"],
    });

    const res = selectSpotlightMeal({
      meals: DEFAULT_MEALS,
      profile: impossibleProfile,
      lessFrequentList: [],
      pantryItems: [],
      recentSpotlightIds: [],
    });

    expect(res.meal).toBeNull();
    expect(res.eligiblePoolCount).toBe(0);
    expect(res.emptyReason).toContain("No saved meals match");
    expect(res.suggestedAdjustments.some((a) => a.action === "generate_ai")).toBe(true);
    expect(res.suggestedAdjustments.some((a) => a.action === "relax_effort")).toBe(true);
    expect(res.suggestedAdjustments.some((a) => a.action === "add_fridge")).toBe(true);
  });
});
