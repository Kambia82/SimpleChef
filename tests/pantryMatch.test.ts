import { describe, it, expect } from "vitest";
import {
  classifyIngredientAgainstPantryName,
  checkIngredientQuantitySufficiency,
  evaluateMealIngredients,
  getMissingIngredients,
} from "../src/utils/pantryMatch";
import { Meal, MealIngredient, PantryItem } from "../src/types";

const ing = (item: string, amount = "1", walmartAisle: MealIngredient["walmartAisle"] = "Pantry / Canned"): MealIngredient => ({
  item,
  amount,
  walmartAisle,
});

describe("3-Tier Pantry Matching & Quantity Awareness", () => {
  it("matches Tier 1 exact equivalents (singular/plural and packaging variants)", () => {
    expect(
      classifyIngredientAgainstPantryName(ing("Flour tortillas", "4", "Bakery"), "tortilla").tier
    ).toBe("exact");
    expect(
      classifyIngredientAgainstPantryName(ing("Large eggs", "3", "Dairy & Eggs"), "Eggs").tier
    ).toBe("exact");
    expect(
      classifyIngredientAgainstPantryName(ing("Pre-cooked chicken strips", "1 cup", "Meat & Deli"), "Rotisserie chicken").tier
    ).toBe("exact");
  });

  it("matches Tier 2 acceptable culinary substitutions cleanly", () => {
    const yogurtSub = classifyIngredientAgainstPantryName(
      ing("Sour cream", "2 tbsp", "Dairy & Eggs"),
      "Greek yogurt"
    );
    expect(yogurtSub.tier).toBe("substitution");
    expect(yogurtSub.note).toBeTruthy();

    const riceSub = classifyIngredientAgainstPantryName(
      ing("Brown rice", "1 pouch"),
      "Jasmine rice"
    );
    expect(riceSub.tier).toBe("substitution");
  });

  it("never treats false synonyms as owned (Tier 3 related_not_equivalent)", () => {
    const cases: Array<[string, string]> = [
      ["Ground beef", "Ground turkey"],
      ["Penne pasta", "Ramen noodles"],
      ["Russet potato", "Sweet potato"],
      ["Baby spinach", "Coleslaw mix"],
      ["Canned tuna", "Rotisserie chicken"],
      ["Marinara sauce", "Alfredo sauce"],
    ];

    for (const [needed, owned] of cases) {
      const res = classifyIngredientAgainstPantryName(ing(needed), owned);
      expect(res.tier).toBe("related_not_equivalent");

      const resolved = evaluateMealIngredients(
        {
          id: "test-meal",
          title: "Test",
          tagline: "Test",
          prepMinutes: 2,
          cookMinutes: 3,
          category: "microwave",
          ingredients: [ing(needed)],
          instructions: [{ stepNumber: 1, title: "Mix", instruction: needed }],
          whyItWorks: "Works",
          rutAlternativeNote: "Note",
        },
        [{ name: owned, quantity: 2 }]
      );

      expect(resolved.matchCount).toBe(0);
      expect(resolved.relatedOnly).toHaveLength(1);
      expect(resolved.missing).toHaveLength(1);
    }
  });

  it("detects insufficient countable pantry quantities (e.g., 1 can owned vs 2 cans needed)", () => {
    expect(checkIngredientQuantitySufficiency("2 cans", 1).sufficient).toBe(false);
    expect(checkIngredientQuantitySufficiency("2 cans", 2).sufficient).toBe(true);
    expect(checkIngredientQuantitySufficiency("2 pouches", 1).note).toContain("Have 1");
  });

  it("returns only unowned/unsubstituted items in getMissingIngredients", () => {
    const meal: Meal = {
      id: "m1",
      title: "Bean Bowl",
      tagline: "Simple bowl",
      prepMinutes: 2,
      cookMinutes: 3,
      category: "microwave",
      ingredients: [
        ing("Microwave rice pouch", "1 pouch"),
        ing("Black beans", "1 can"),
        ing("Salsa", "1/2 cup"),
      ],
      instructions: [{ stepNumber: 1, title: "Cook", instruction: "Heat all" }],
      whyItWorks: "Fast",
      rutAlternativeNote: "Nice",
    };

    const pantry: PantryItem[] = [
      { name: "Jasmine rice", quantity: 1 },
      { name: "Black beans", quantity: 1 },
    ];

    const missing = getMissingIngredients(meal, pantry);
    expect(missing).toHaveLength(1);
    expect(missing[0].item).toBe("Salsa");
  });
});
