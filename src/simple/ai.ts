// Asks the server (Gemini) for fresh meal ideas and converts them to the app's Recipe shape.
import type { Meal, MealIngredient } from "../types";
import { inferIngredientStorage } from "../utils/kitchenProfile";
import type { Aisle, Appliance, KitchenSetup, MealType, Recipe } from "./types";
import { appliancesFor, fridgeLevel } from "./logic";

const AISLES: Aisle[] = ["Produce", "Meat & Deli", "Dairy & Eggs", "Bakery", "Frozen", "Pantry / Canned", "Spices & Condiments"];
const EQUIPMENT_TO_APPLIANCE: Record<string, Appliance> = {
  stove: "stove",
  oven: "oven",
  microwave: "microwave",
  air_fryer: "air fryer",
  toaster: "toaster",
};
const EMOJI_BY_TYPE: Record<MealType, string> = { breakfast: "🍳", lunch: "🥪", dinner: "🍽️", snack: "🥨" };

/** The server's request format (older kitchen profile). */
export function setupToKitchenProfile(setup: KitchenSetup) {
  const level = fridgeLevel(setup);
  const equipment: string[] = appliancesFor(setup).map((a) => (a === "air fryer" ? "air_fryer" : a));
  if (level >= 1) equipment.push("fridge");
  if (level === 2) equipment.push("freezer");
  return {
    environment: "custom",
    equipment,
    hasFreezer: level === 2,
    effort: "low",
    varietyPreference: "balanced",
    dietaryRestrictions: [],
    livingSituation: setup.kitchen === "dorm" || setup.kitchen === "barracks" ? "dorm" : "standard",
    sharedKitchen: "none",
  };
}

export function mealToRecipe(meal: Meal, index = 0): Recipe {
  const storages = meal.ingredients.map((i: MealIngredient) => inferIngredientStorage(i));
  const fridge: Recipe["fridge"] = meal.requiresFreezer || storages.includes("freezer") ? 2 : storages.includes("fridge") ? 1 : 0;
  const cook = (meal.requiredEquipment ?? [])
    .map((e) => EQUIPMENT_TO_APPLIANCE[e])
    .filter((a): a is Appliance => Boolean(a));
  const mealType: MealType =
    meal.mealType === "breakfast" || meal.mealType === "lunch" || meal.mealType === "snack" ? meal.mealType : "dinner";
  return {
    id: `ai-${Date.now()}-${index}`,
    name: meal.title,
    emoji: EMOJI_BY_TYPE[mealType],
    plate: (index % 5) + 1,
    mealType,
    minutes: Math.max(1, (meal.prepMinutes || 0) + (meal.cookMinutes || 0)),
    lowEffort: meal.effortLevel === "very_low" || meal.effortLevel === "low",
    classic: false,
    // A meal that needs any of several appliances is listed with all of them; requiring one is enough.
    cook,
    fridge,
    description: meal.tagline || meal.whyItWorks,
    rememberAs: meal.rememberAs || meal.ingredients.slice(0, 6).map((i) => i.item).join(" + "),
    ingredients: meal.ingredients.map((i) => ({
      name: i.item,
      qty: null,
      unit: i.amount,
      aisle: AISLES.includes(i.walmartAisle as Aisle) ? (i.walmartAisle as Aisle) : "Pantry / Canned",
      key: i.item.toLowerCase(),
    })),
    steps: meal.instructions.map((s) => s.instruction),
    lazyVersion: meal.lazyVersion,
    generated: true,
  };
}

export async function fetchAiIdeas(
  setup: KitchenSetup,
  mealType: MealType,
  onHand: string[],
  existingTitles: string[]
): Promise<Recipe[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetch("/api/generate-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        kitchenProfile: setupToKitchenProfile(setup),
        mealType,
        pantryItems: onHand.slice(0, 25),
        existingTitles: existingTitles.slice(0, 25),
      }),
    });
    if (res.status === 429) throw new Error("Taking a breather. Try again in a few minutes.");
    if (!res.ok) throw new Error("New ideas aren't available right now.");
    const data = (await res.json()) as { meals?: Meal[] };
    return (data.meals ?? []).map(mealToRecipe);
  } finally {
    clearTimeout(timer);
  }
}
