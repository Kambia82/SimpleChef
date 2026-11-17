import { describe, it, expect } from "vitest";
import { inferIngredientStorage, needsFridgeAfterOpening } from "../src/utils/kitchenProfile";
import { MealIngredient } from "../src/types";

const ing = (item: string, amount: string, walmartAisle: MealIngredient["walmartAisle"]): MealIngredient => ({
  item,
  amount,
  walmartAisle,
});

describe("per-ingredient storage tags", () => {
  it("treats sealed dorm staples as plain shelf-stable", () => {
    for (const i of [
      ing("Canned beef chili with beans (pull-tab)", "1 can (15 oz)", "Pantry / Canned"),
      ing("Microwave rice pouch", "1 pouch", "Pantry / Canned"),
      ing("Creamy peanut butter", "2 tablespoons", "Pantry / Canned"),
      ing("Unsweetened applesauce cup (or 1 small fresh apple)", "1 cup (4 oz)", "Pantry / Canned"),
      ing("Soy sauce", "1 tablespoon", "Spices & Condiments"),
    ]) {
      expect(inferIngredientStorage(i)).toBe("shelf_stable");
      expect(needsFridgeAfterOpening(i)).toBe(false);
    }
  });

  it("flags jars and partial cans that need a fridge once opened", () => {
    expect(needsFridgeAfterOpening(ing("Jarred salsa", "1/3 cup", "Pantry / Canned"))).toBe(true);
    expect(needsFridgeAfterOpening(ing("Jarred marinara sauce", "2/3 cup", "Pantry / Canned"))).toBe(true);
    expect(needsFridgeAfterOpening(ing("Canned black beans (drained)", "1/2 cup", "Pantry / Canned"))).toBe(true);
  });

  it("does not double-flag items that already need a fridge", () => {
    const cheese = ing("Shredded cheddar cheese", "1/3 cup", "Dairy & Eggs");
    expect(inferIngredientStorage(cheese)).toBe("fridge");
    expect(needsFridgeAfterOpening(cheese)).toBe(false);
  });
});
