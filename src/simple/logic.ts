import type { Appliance, KitchenSetup, MealType, Recipe, RecipeIngredient } from "./types";

export const AISLES = [
  "Produce",
  "Meat & Deli",
  "Dairy & Eggs",
  "Bakery",
  "Frozen",
  "Pantry / Canned",
  "Spices & Condiments",
] as const;

/** 0 = no fridge, 1 = mini fridge, 2 = full fridge with freezer. */
export function fridgeLevel(setup: KitchenSetup): 0 | 1 | 2 {
  if (setup.kitchen === "full") return 2;
  return setup.fridge === "full" ? 2 : setup.fridge === "mini" ? 1 : 0;
}

export function appliancesFor(setup: KitchenSetup): Appliance[] {
  if (setup.kitchen === "full") return setup.appliances;
  if (setup.kitchen === "micro") return ["microwave"];
  return setup.microwave === "none" ? [] : ["microwave"];
}

export function fits(recipe: Recipe, setup: KitchenSetup): boolean {
  const owned = appliancesFor(setup);
  const canCook = recipe.cook.length === 0 || recipe.cook.some((a) => owned.includes(a));
  return canCook && recipe.fridge <= fridgeLevel(setup);
}

/** Why a recipe doesn't fit, e.g. "Needs a fridge · Needs stove". Empty when it fits. */
export function missingReason(recipe: Recipe, setup: KitchenSetup): string {
  const reasons: string[] = [];
  if (recipe.fridge > fridgeLevel(setup)) {
    reasons.push(recipe.fridge === 2 ? "Needs fridge & freezer" : "Needs a fridge");
  }
  const owned = appliancesFor(setup);
  if (recipe.cook.length > 0 && !recipe.cook.some((a) => owned.includes(a))) {
    reasons.push(`Needs ${recipe.cook.join(" or ")}`);
  }
  return reasons.join(" · ");
}

export function isClassic(recipe: Recipe, setup: KitchenSetup): boolean {
  return recipe.classic || (fridgeLevel(setup) === 0 && Boolean(recipe.roomClassic));
}

export function classicsLabel(setup: KitchenSetup): string {
  return fridgeLevel(setup) === 0 ? "Room classics" : "Shortcut classics";
}

const FRACTIONS: Array<[number, string]> = [
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.5, "½"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
];

/** Formats a quantity using kitchen fractions (½, ⅓, ¼...). */
export function formatQty(q: number, whole = false): string {
  if (whole) return String(Math.max(1, Math.ceil(q - 0.01)));
  const w = Math.floor(q + 1e-9);
  const f = q - w;
  if (f < 0.1) return String(w || 1);
  if (f > 0.9) return String(w + 1);
  const [, glyph] = FRACTIONS.reduce((best, cur) =>
    Math.abs(cur[0] - f) < Math.abs(best[0] - f) ? cur : best
  );
  return `${w || ""}${glyph}`;
}

const PLURAL_UNITS: Record<string, string> = {
  slice: "slices",
  cup: "cups",
  can: "cans",
  bag: "bags",
  pouch: "pouches",
  link: "links",
  pack: "packs",
  handful: "handfuls",
};

export function scaledAmount(ing: RecipeIngredient, servings: number): string {
  if (ing.qty == null) return ing.unit;
  const amount = ing.qty * servings;
  const value = formatQty(amount, ing.whole);
  const unit = amount > 1.1 && PLURAL_UNITS[ing.unit] ? PLURAL_UNITS[ing.unit] : ing.unit;
  return unit ? `${value} ${unit}` : value;
}

/** Replaces {n} placeholders with ingredient n's amount for the chosen servings. */
export function fillStep(recipe: Recipe, text: string, servings: number): string {
  return text.replace(/\{(\d+)\}/g, (match, i) => {
    const ing = recipe.ingredients[Number(i)];
    return ing ? scaledAmount(ing, servings) : match;
  });
}

export function mealTypeForHour(hour: number): MealType {
  return hour < 11 ? "breakfast" : hour < 15 ? "lunch" : "dinner";
}

export function greetingForHour(hour: number): string {
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  return items
    .map((item) => [random(), item] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, item]) => item);
}

/**
 * One random recipe that fits the setup, preferring the given meal type and
 * avoiding `excludeId` (so "Something else" never repeats the same meal).
 */
export function pickOne(
  recipes: Recipe[],
  setup: KitchenSetup,
  mealType: MealType,
  excludeId?: string,
  random: () => number = Math.random
): Recipe | null {
  const eligible = recipes.filter((r) => fits(r, setup) && r.id !== excludeId);
  const sameType = eligible.filter((r) => r.mealType === mealType);
  const pool = sameType.length > 0 ? sameType : eligible;
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)];
}

export function haveCount(recipe: Recipe, onHand: Set<string>): number {
  return recipe.ingredients.filter((i) => onHand.has(i.key)).length;
}
