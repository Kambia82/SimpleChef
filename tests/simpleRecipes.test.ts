import { describe, it, expect } from "vitest";
import { RECIPES } from "../src/simple/recipes";
import {
  fits,
  fillStep,
  formatQty,
  isClassic,
  missingReason,
  pickOne,
  scaledAmount,
} from "../src/simple/logic";
import type { KitchenSetup } from "../src/simple/types";

const setup = (over: Partial<KitchenSetup>): KitchenSetup => ({
  kitchen: "full",
  appliances: ["stove", "oven", "microwave"],
  fridge: "full",
  microwave: "mine",
  servings: 1,
  ...over,
});

describe("recipe library", () => {
  it("has unique ids and step placeholders that point at real ingredients", () => {
    const ids = new Set<string>();
    for (const r of RECIPES) {
      expect(ids.has(r.id)).toBe(false);
      ids.add(r.id);
      expect(r.ingredients.length).toBeLessThanOrEqual(7);
      for (const text of [...r.steps, r.lazyVersion ?? ""]) {
        for (const m of text.matchAll(/\{(\d+)\}/g)) {
          expect(Number(m[1])).toBeLessThan(r.ingredients.length);
        }
      }
    }
  });

  it("keeps every setup stocked with something to eat", () => {
    const barracks = setup({ kitchen: "barracks", fridge: "none", microwave: "none" });
    const dormNoFridge = setup({ kitchen: "dorm", fridge: "none", microwave: "shared" });
    expect(RECIPES.filter((r) => fits(r, barracks)).length).toBeGreaterThanOrEqual(6);
    expect(RECIPES.filter((r) => fits(r, dormNoFridge) && isClassic(r, dormNoFridge)).length).toBeGreaterThan(0);
  });
});

describe("setup matching", () => {
  const bagel = RECIPES.find((r) => r.id === "bagel")!;
  const scampi = RECIPES.find((r) => r.id === "scampi")!;

  it("hides fridge meals from a no-fridge dorm and explains why", () => {
    const dorm = setup({ kitchen: "dorm", fridge: "none", microwave: "shared" });
    expect(fits(bagel, dorm)).toBe(false);
    expect(missingReason(bagel, dorm)).toBe("Needs a fridge");
    expect(missingReason(scampi, dorm)).toBe("Needs fridge & freezer");
  });

  it("allows a mini-fridge dorm with a shared microwave to make the breakfast sandwich", () => {
    expect(fits(bagel, setup({ kitchen: "dorm", fridge: "mini", microwave: "shared" }))).toBe(true);
  });

  it("requires one of the listed appliances", () => {
    const sausage = RECIPES.find((r) => r.id === "sausage")!;
    expect(fits(sausage, setup({ appliances: ["stove", "microwave"] }))).toBe(false);
    expect(fits(sausage, setup({ appliances: ["air fryer"] }))).toBe(true);
  });
});

describe("servings and amounts", () => {
  it("formats kitchen fractions", () => {
    expect(formatQty(0.5)).toBe("½");
    expect(formatQty(1.5)).toBe("1½");
    expect(formatQty(0.33)).toBe("⅓");
    expect(formatQty(2)).toBe("2");
    expect(formatQty(1.5, true)).toBe("2");
  });

  it("scales amounts and fills them into steps", () => {
    const bagel = RECIPES.find((r) => r.id === "bagel")!;
    expect(scaledAmount(bagel.ingredients[3], 2)).toBe("1 cup");
    expect(scaledAmount(bagel.ingredients[2], 2)).toBe("2 slices");
    expect(fillStep(bagel, bagel.steps[1], 2)).toBe("Scramble 4 eggs in a buttered pan, about 2 minutes.");
  });

  it("pick never repeats the excluded meal", () => {
    const s = setup({});
    for (let i = 0; i < 20; i++) {
      const first = pickOne(RECIPES, s, "breakfast")!;
      expect(pickOne(RECIPES, s, "breakfast", first.id)!.id).not.toBe(first.id);
    }
  });
});
