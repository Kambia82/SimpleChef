import { Meal, MealIngredient, PantryItem } from "../types";

const SYNONYM_GROUPS: string[][] = [
  ["tortilla", "tortillas", "wrap", "wraps"],
  ["egg", "eggs"],
  ["black bean", "black beans", "beans", "pinto beans", "kidney beans"],
  ["rotisserie chicken", "shredded chicken", "chicken breast", "chicken", "deli chicken"],
  ["shredded cheese", "cheese", "cheddar", "mozzarella", "mexican blend", "feta", "parmesan"],
  ["salsa", "pico"],
  ["frozen veggies", "frozen vegetable", "frozen broccoli", "frozen peas", "frozen corn", "frozen bell pepper", "mixed vegetables"],
  ["microwave rice", "rice pouch", "rice", "jasmine rice", "brown rice"],
  ["pasta", "tortellini", "macaroni", "penne", "spaghetti", "noodles", "ramen"],
  ["pasta sauce", "marinara", "alfredo", "pesto"],
  ["spinach", "greens", "salad", "salad kit", "coleslaw", "cabbage", "lettuce"],
  ["ground beef", "ground turkey", "turkey", "beef", "pork"],
  ["sweet potato", "potato", "potatoes", "hashbrowns", "tater tots"],
  ["kielbasa", "sausage", "smoked sausage"],
  ["greek yogurt", "yogurt"],
  ["naan", "flatbread", "pita", "bread", "toast", "english muffin", "english muffins", "bagel"],
  ["tuna", "canned tuna"],
  ["tomato soup", "soup"],
  ["peanut butter"],
  ["avocado", "guacamole"],
  ["soy sauce", "teriyaki"],
  ["bbq sauce"],
  ["meatball", "meatballs", "frozen meatballs"],
  ["potsticker", "potstickers", "dumpling", "dumplings"],
  ["chicken tender", "chicken tenders", "chicken nugget", "chicken nuggets"],
  ["shrimp", "frozen shrimp"],
  ["salmon", "fish fillet", "frozen salmon"],
  ["deli turkey", "deli ham", "deli meat", "lunch meat"],
  ["chickpea", "chickpeas", "garbanzo"],
  ["oats", "oatmeal", "rolled oats"],
  ["cottage cheese"],
  ["hummus"],
  ["berries", "frozen berries", "strawberries", "blueberries"],
  ["waffle", "waffles", "frozen waffles"],
  ["bacon", "pre-cooked bacon"],
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePantryList(raw: unknown): PantryItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, PantryItem>();

  for (const entry of raw) {
    let name = "";
    let quantity = 1;

    if (typeof entry === "string") {
      name = entry.trim();
    } else if (entry && typeof entry === "object" && "name" in entry) {
      const obj = entry as { name?: unknown; quantity?: unknown };
      if (typeof obj.name === "string") {
        name = obj.name.trim();
      }
      if (typeof obj.quantity === "number" && Number.isFinite(obj.quantity)) {
        quantity = Math.max(0, Math.min(999, Math.round(obj.quantity)));
      }
    }

    if (!name || quantity <= 0) continue;
    const key = name.toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(999, existing.quantity + quantity);
    } else {
      merged.set(key, { name, quantity });
    }
  }

  return Array.from(merged.values());
}

export function singleIngredientMatchesPantryName(ingredient: MealIngredient, pantryName: string): boolean {
  const ingNorm = normalizeText(ingredient.item);
  const pantryNorm = normalizeText(pantryName);
  if (!pantryNorm) return false;

  if (ingNorm.includes(pantryNorm) || pantryNorm.includes(ingNorm)) {
    return true;
  }

  for (const group of SYNONYM_GROUPS) {
    const ingInGroup = group.some((term) => ingNorm.includes(term));
    const pantryInGroup = group.some((term) => pantryNorm.includes(term));
    if (ingInGroup && pantryInGroup) {
      return true;
    }
  }

  const pantryWords = pantryNorm.split(" ").filter((w) => w.length >= 4);
  if (pantryWords.length > 0 && pantryWords.every((w) => ingNorm.includes(w))) {
    return true;
  }

  return false;
}

export function findMatchingPantryItem(ingredient: MealIngredient, pantryItems: PantryItem[]): PantryItem | null {
  for (const item of pantryItems) {
    if (item.quantity > 0 && singleIngredientMatchesPantryName(ingredient, item.name)) {
      return item;
    }
  }
  return null;
}

export function ingredientMatchesPantry(ingredient: MealIngredient, pantryItems: PantryItem[]): boolean {
  return findMatchingPantryItem(ingredient, pantryItems) !== null;
}

export function getPantryMatchStats(meal: Meal, pantryItems: PantryItem[]) {
  const totalCount = meal.ingredients.length;
  const matchedIngredients = meal.ingredients.map((ing) =>
    ingredientMatchesPantry(ing, pantryItems)
  );
  const matchCount = matchedIngredients.filter(Boolean).length;
  const ratio = totalCount > 0 ? matchCount / totalCount : 0;

  return {
    matchCount,
    totalCount,
    ratio,
    matchedIngredients,
    isFullMatch: totalCount > 0 && matchCount === totalCount,
  };
}

export function getMissingIngredients(meal: Meal, pantryItems: PantryItem[]): MealIngredient[] {
  return meal.ingredients.filter((ing) => !ingredientMatchesPantry(ing, pantryItems));
}
