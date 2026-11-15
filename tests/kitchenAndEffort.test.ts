import { describe, it, expect } from "vitest";
import { DEFAULT_MEALS } from "../src/data/defaultMeals";
import {
  createProfileForEnvironment,
  getMealEligibility,
  isMealEquipmentCompatible,
} from "../src/utils/kitchenProfile";
import { getMealExtras } from "../src/utils/mealExtras";
import { KitchenProfile, Meal } from "../src/types";

describe("Independent Cooking Environment & Effort Engine", () => {
  it("excludes stovetop, oven, freezer, and chilled meals in strictly shelf-stable Microwave Only mode", () => {
    const microOnly = createProfileForEnvironment("microwave_only", { effort: "low" });
    expect(microOnly.equipment).toEqual(["microwave"]);
    expect(microOnly.hasFreezer).toBe(false);

    const eligible = DEFAULT_MEALS.filter(
      (m) => getMealEligibility(m, microOnly, { effortMatchMode: "any" }).eligible
    );
    expect(eligible.length).toBeGreaterThan(0);

    for (const meal of eligible) {
      const check = isMealEquipmentCompatible(meal, microOnly);
      expect(check.compatible).toBe(true);
      expect(meal.requiresFreezer).not.toBe(true);
      expect(meal.ingredients.some((i) => i.walmartAisle === "Frozen")).toBe(false);
    }
  });

  it("allows Mini-Fridge meals in microwave_mini_fridge while still blocking stove/oven/freezer", () => {
    const microFridge = createProfileForEnvironment("microwave_mini_fridge", { effort: "moderate" });
    const loadedPotato = DEFAULT_MEALS.find((m) => m.id === "dorm-loaded-baked-potato-broccoli");
    const skilletDish = DEFAULT_MEALS.find((m) => m.id === "full-honey-garlic-chicken-broccoli-skillet");

    expect(loadedPotato).toBeDefined();
    expect(skilletDish).toBeDefined();
    expect(getMealEligibility(loadedPotato!, microFridge, { effortMatchMode: "exact" }).eligible).toBe(true);
    expect(getMealEligibility(skilletDish!, microFridge, { effortMatchMode: "any" }).eligible).toBe(false);
  });

  it("supports Normal cooking in Full Kitchen independently from Very Low effort in Full Kitchen", () => {
    const fullNormal = createProfileForEnvironment("full_kitchen", { effort: "normal" });
    const fullVeryLow = createProfileForEnvironment("full_kitchen", { effort: "very_low" });

    const normalMatches = DEFAULT_MEALS.filter(
      (m) => getMealEligibility(m, fullNormal, { effortMatchMode: "exact" }).eligible
    );
    const veryLowMatches = DEFAULT_MEALS.filter(
      (m) => getMealEligibility(m, fullVeryLow, { effortMatchMode: "exact" }).eligible
    );

    expect(normalMatches.length).toBeGreaterThanOrEqual(4);
    expect(veryLowMatches.length).toBeGreaterThanOrEqual(3);
    expect(normalMatches.some((m) => m.ingredients.length >= 6)).toBe(true);
    expect(veryLowMatches.every((m) => m.ingredients.length <= 5)).toBe(true);
  });

  it("respects custom equipment selections cleanly (e.g., Air Fryer + Fridge without Microwave)", () => {
    const airFryerOnly: KitchenProfile = {
      environment: "custom",
      equipment: ["air_fryer", "fridge"],
      hasFreezer: false,
      effort: "low",
      varietyPreference: "balanced",
      dietaryRestrictions: [],
    };
    const bites = DEFAULT_MEALS.find((m) => m.id === "limited-air-fryer-garlic-chicken-bites");
    const microRamen = DEFAULT_MEALS.find((m) => m.id === "dorm-spicy-peanut-chicken-ramen");
    expect(bites).toBeDefined();
    expect(microRamen).toBeDefined();

    expect(isMealEquipmentCompatible(bites!, airFryerOnly).compatible).toBe(true);
    expect(isMealEquipmentCompatible(microRamen!, airFryerOnly).compatible).toBe(false);
  });

  it("does not shame or ban comfort foods unless user selects 'new_ideas' and explicitly lists them", () => {
    const nachos = DEFAULT_MEALS.find((m) => m.id === "dorm-loaded-chicken-nachos");
    expect(nachos).toBeDefined();

    const balanced = createProfileForEnvironment("microwave_mini_fridge", {
      effort: "very_low",
      varietyPreference: "balanced",
    });
    const newIdeas = createProfileForEnvironment("microwave_mini_fridge", {
      effort: "very_low",
      varietyPreference: "new_ideas",
    });

    const userList = [{ id: "1", name: "Nachos", dateAdded: new Date().toISOString() }];

    expect(
      getMealEligibility(nachos!, balanced, { effortMatchMode: "exact", lessFrequentList: userList }).eligible
    ).toBe(true);
    expect(
      getMealEligibility(nachos!, newIdeas, { effortMatchMode: "exact", lessFrequentList: userList }).eligible
    ).toBe(false);
  });

  it("filters out incompatible toaster-oven and frozen add-ons/sides for microwave-only users", () => {
    const pastaMeal: Meal = {
      id: "test-pasta",
      title: "Quick Marinara Tortellini",
      tagline: "Warm pasta bowl",
      prepMinutes: 2,
      cookMinutes: 4,
      category: "microwave",
      ingredients: [
        { item: "Pasta", amount: "1 cup", walmartAisle: "Pantry / Canned" },
        { item: "Marinara sauce", amount: "1 cup", walmartAisle: "Pantry / Canned" },
      ],
      instructions: [{ stepNumber: 1, title: "Heat", instruction: "Microwave 3 minutes." }],
      whyItWorks: "Fast",
      rutAlternativeNote: "Comforting",
    };

    const microExtras = getMealExtras(pastaMeal, {
      equipment: ["microwave"],
      hasFreezer: false,
    });
    const fullExtras = getMealExtras(pastaMeal, {
      equipment: ["stove", "oven", "microwave", "toaster", "fridge", "freezer"],
      hasFreezer: true,
    });

    expect(
      microExtras.sides.some(
        (s) => s.walmartAisle === "Frozen" || /toaster/i.test(`${s.item} ${s.howToUse}`)
      )
    ).toBe(false);
    expect(fullExtras.sides.some((s) => /toast/i.test(s.item))).toBe(true);
  });

  it("provides >= 25 distinct shelf-stable microwave_only meals across diverse categories without kettle/hot-plate/colander steps", () => {
    const ids = DEFAULT_MEALS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);

    const microOnly = createProfileForEnvironment("microwave_only", {
      effort: "low",
      livingSituation: "dorm",
      sharedKitchen: "available_avoid",
    });
    const microEligible = DEFAULT_MEALS.filter(
      (m) => getMealEligibility(m, microOnly, { effortMatchMode: "any" }).eligible
    );
    expect(microEligible.length).toBeGreaterThanOrEqual(25);

    const types = new Set(microEligible.map((m) => m.mealType));
    expect(types.has("breakfast")).toBe(true);
    expect(types.has("lunch")).toBe(true);
    expect(types.has("dinner")).toBe(true);
    expect(types.has("snack")).toBe(true);

    for (const meal of microEligible) {
      const steps = meal.instructions.map((s) => s.instruction).join(" ");
      expect(steps).not.toMatch(/\b(electric kettle|hot plate|colander)\b/i);
    }
  });

  it("does not false-reject peanut butter in dairy_free mode and enforces missing fridge in custom profiles", () => {
    const dairyFreeProfile = createProfileForEnvironment("microwave_only", {
      effort: "very_low",
      dietaryRestrictions: ["dairy_free"],
    });
    const pbWrap = DEFAULT_MEALS.find((m) => m.id === "dorm-pb-banana-granola-wrap");
    expect(pbWrap).toBeDefined();
    expect(
      getMealEligibility(pbWrap!, dairyFreeProfile, { effortMatchMode: "exact" }).eligible
    ).toBe(true);

    const customNoFridge: KitchenProfile = {
      environment: "custom",
      equipment: ["microwave", "other"],
      otherEquipmentLabel: "Rice Cooker",
      hasFreezer: false,
      effort: "low",
      varietyPreference: "balanced",
      dietaryRestrictions: [],
    };
    const loadedPotato = DEFAULT_MEALS.find((m) => m.id === "dorm-loaded-baked-potato-broccoli");
    expect(loadedPotato).toBeDefined();
    expect(isMealEquipmentCompatible(loadedPotato!, customNoFridge).compatible).toBe(false);
  });

  it("keeps dorm mode independent and switches stovetop eligibility cleanly with sharedKitchen", () => {
    const skilletDish = DEFAULT_MEALS.find((m) => m.id === "full-honey-garlic-chicken-broccoli-skillet");
    expect(skilletDish).toBeDefined();

    const dormAvoid = createProfileForEnvironment("microwave_mini_fridge", {
      effort: "low",
      livingSituation: "dorm",
      sharedKitchen: "available_avoid",
    });
    const dormUse = createProfileForEnvironment("microwave_mini_fridge", {
      effort: "low",
      livingSituation: "dorm",
      sharedKitchen: "available_use",
    });

    expect(getMealEligibility(skilletDish!, dormAvoid, { effortMatchMode: "any" }).eligible).toBe(false);
    expect(getMealEligibility(skilletDish!, dormUse, { effortMatchMode: "any" }).eligible).toBe(true);
  });

  it("provides >= 3 Normal Cooking meals in every environment preset without forcing stove/oven", () => {
    for (const env of [
      "full_kitchen",
      "microwave_only",
      "microwave_mini_fridge",
      "limited_kitchen",
    ] as const) {
      const p = createProfileForEnvironment(env, { effort: "normal" });
      const normalMatches = DEFAULT_MEALS.filter(
        (m) => getMealEligibility(m, p, { effortMatchMode: "exact" }).eligible
      );
      expect(normalMatches.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("blocks stove, oven, air-fryer, toaster, and freezer meals in Dorm mode even if environment was left on full_kitchen", () => {
    const dormWithFullPreset = createProfileForEnvironment("full_kitchen", {
      livingSituation: "dorm",
      sharedKitchen: "none",
      effort: "very_low",
    });

    const eligibleAllEfforts = DEFAULT_MEALS.filter(
      (m) => getMealEligibility(m, dormWithFullPreset, { effortMatchMode: "any" }).eligible
    );
    expect(eligibleAllEfforts.length).toBeGreaterThan(0);

    for (const meal of eligibleAllEfforts) {
      expect(meal.requiresFreezer).not.toBe(true);
      expect(meal.requiredEquipment).not.toContain("stove");
      expect(meal.requiredEquipment).not.toContain("oven");
      expect(meal.requiredEquipment).not.toContain("air_fryer");
      expect(meal.requiredEquipment).not.toContain("toaster");
    }

    const airFryerMeal = DEFAULT_MEALS.find((m) => m.id === "limited-air-fryer-garlic-chicken-bites");
    const miniPizzas = DEFAULT_MEALS.find((m) => m.id === "english-muffin-mini-pizzas");
    const frozenSub = DEFAULT_MEALS.find((m) => m.id === "frozen-meatball-marinara-subs");
    expect(getMealEligibility(airFryerMeal!, dormWithFullPreset, { effortMatchMode: "any" }).eligible).toBe(false);
    expect(getMealEligibility(miniPizzas!, dormWithFullPreset, { effortMatchMode: "any" }).eligible).toBe(false);
    expect(getMealEligibility(frozenSub!, dormWithFullPreset, { effortMatchMode: "any" }).eligible).toBe(false);

    // Unchecking limitedFreezerSpace + enabling hasFreezer unlocks freezer dorm meals without unlocking stove/oven
    const dormWithMiniFreezerBase = createProfileForEnvironment("microwave_mini_fridge", {
      livingSituation: "dorm",
      dormConstraints: {
        limitedFridgeSpace: true,
        limitedFreezerSpace: false,
        limitedFoodStorage: true,
        limitedCounterSpace: true,
        sharedAppliances: true,
        minimalCookware: true,
        preferShelfStable: true,
        smallerQuantities: true,
      },
    });
    const dormWithMiniFreezer: KitchenProfile = {
      ...dormWithMiniFreezerBase,
      hasFreezer: true,
      equipment: ["microwave", "fridge", "freezer"],
    };
    expect(getMealEligibility(frozenSub!, dormWithMiniFreezer, { effortMatchMode: "any" }).eligible).toBe(true);
    expect(getMealEligibility(airFryerMeal!, dormWithMiniFreezer, { effortMatchMode: "any" }).eligible).toBe(false);
  });

  it("detects hidden stove or oven instructions even when requiredEquipment claims microwave only", () => {
    const disguisedSkilletMeal: Meal = {
      id: "disguised-skillet",
      title: "Sneaky Skillet Pasta",
      tagline: "Claims microwave but uses a skillet",
      prepMinutes: 3,
      cookMinutes: 5,
      category: "microwave",
      requiredEquipment: ["microwave"],
      ingredients: [{ item: "Pasta", amount: "1 cup", walmartAisle: "Pantry / Canned" }],
      instructions: [
        {
          stepNumber: 1,
          title: "Cook in Skillet",
          instruction: "Heat olive oil in a frying pan over medium heat and simmer for 4 minutes.",
        },
      ],
      whyItWorks: "Test",
      rutAlternativeNote: "Test",
    };

    const microProfile = createProfileForEnvironment("microwave_only", {
      livingSituation: "dorm",
      effort: "low",
    });
    expect(isMealEquipmentCompatible(disguisedSkilletMeal, microProfile).compatible).toBe(false);
    expect(getMealEligibility(disguisedSkilletMeal, microProfile, { effortMatchMode: "any" }).eligible).toBe(false);
  });
});
