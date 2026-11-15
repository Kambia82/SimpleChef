import {
  CookingEquipment,
  KitchenMode,
  KitchenProfile,
  Meal,
  MealIngredient,
  PantryItem,
} from "../types";
import {
  createProfileForEnvironment,
  isMealEquipmentCompatible,
  inferMealRequirements,
} from "./kitchenProfile";

export type PantryMatchTier =
  | "exact"
  | "substitution"
  | "related_not_equivalent"
  | "none";

export interface IngredientPantryResolution {
  ingredient: MealIngredient;
  tier: PantryMatchTier;
  matchedItem: PantryItem | null;
  hasInPantry: boolean;
  quantitySufficient: boolean;
  note?: string;
}

// Tier 1: True equivalents / singular-plural / packaging variations of the SAME ingredient
const EXACT_EQUIVALENT_GROUPS: string[][] = [
  ["flour tortilla", "flour tortillas", "tortilla", "tortillas", "wrap", "wraps"],
  ["corn tortilla", "corn tortillas"],
  ["egg", "eggs", "large egg", "large eggs"],
  ["rotisserie chicken", "shredded chicken", "grilled chicken strips", "pouch chicken", "canned chicken", "diced chicken", "pre-cooked chicken"],
  ["chicken breast", "chicken breasts"],
  ["chicken thighs", "chicken thigh"],
  ["shredded cheddar", "cheddar cheese", "sliced cheddar", "cheddar"],
  ["shredded mozzarella", "mozzarella cheese", "mozzarella"],
  ["mexican blend cheese", "mexican cheese", "shredded mexican blend"],
  ["parmesan cheese", "grated parmesan", "parmesan"],
  ["jarred marinara", "marinara sauce", "marinara", "pasta sauce", "pizza sauce"],
  ["alfredo sauce", "jarred alfredo"],
  ["microwave rice", "rice pouch", "jasmine rice", "white rice", "cooked rice"],
  ["brown rice", "microwave brown rice"],
  ["black bean", "black beans", "canned black beans"],
  ["pinto bean", "pinto beans"],
  ["chickpea", "chickpeas", "garbanzo beans"],
  ["elbow macaroni", "macaroni", "quick-cooking elbow macaroni"],
  ["penne", "rotini", "rigatoni", "spaghetti", "fettuccine", "dry pasta", "pasta"],
  ["ramen", "ramen noodles", "ramen noodle packet", "instant ramen"],
  ["frozen broccoli", "frozen broccoli florets", "steam-in-bag broccoli", "broccoli florets", "broccoli"],
  ["frozen mixed veggies", "frozen peas and carrots", "mixed veggies", "frozen veggies"],
  ["baby spinach", "spinach", "fresh spinach"],
  ["shredded lettuce", "lettuce", "romaine"],
  ["bagged caesar salad kit", "caesar salad kit", "bagged salad kit", "salad kit"],
  ["coleslaw mix", "shredded cabbage", "tri-color coleslaw mix"],
  ["pre-cooked bacon", "bacon slices", "bacon bits", "real bacon bits", "bacon"],
  ["smoked sausage", "kielbasa", "pre-cooked sausage"],
  ["canned beef chili", "beef chili", "canned chili"],
  ["canned tuna", "tuna", "tuna pouch", "tear-open tuna pouch"],
  ["canned tomato soup", "tomato soup"],
  ["frozen meatballs", "fully-cooked meatballs", "meatballs"],
  ["frozen chicken tenders", "chicken tenders", "chicken nuggets", "frozen chicken nuggets"],
  ["frozen potstickers", "potstickers", "dumplings", "frozen dumplings"],
  ["frozen shrimp", "pre-cooked shrimp", "shrimp"],
  ["salmon fillet", "salmon", "frozen salmon"],
  ["frozen hashbrowns", "shredded hashbrowns", "hashbrowns"],
  ["tater tots", "frozen tater tots"],
  ["frozen waffles", "waffles", "waffle"],
  ["frozen berries", "berries", "mixed berries"],
  ["strawberries"],
  ["blueberries"],
  ["salsa", "jarred salsa"],
  ["pico de gallo", "pico"],
  ["guacamole", "guacamole cup", "mini guacamole cup"],
  ["avocado", "avocados"],
  ["greek yogurt", "plain greek yogurt", "vanilla greek yogurt"],
  ["sour cream"],
  ["mayo", "mayonnaise"],
  ["ranch", "ranch dressing"],
  ["buffalo sauce", "buffalo wing sauce"],
  ["hot sauce", "sriracha"],
  ["bbq sauce", "barbecue sauce"],
  ["soy sauce"],
  ["teriyaki sauce", "teriyaki"],
  ["sesame oil", "toasted sesame oil"],
  ["olive oil", "cooking oil", "vegetable oil", "canola oil"],
  ["butter", "unsalted butter", "salted butter", "garlic butter"],
  ["bread", "bread slices", "sandwich bread", "toast"],
  ["sub rolls", "sub roll", "hoagie buns", "hoagie", "hot dog buns"],
  ["burger buns", "hamburger buns", "buns"],
  ["english muffin", "english muffins"],
  ["naan", "naan flatbread", "naan bread", "flatbread"],
  ["bagel", "bagels"],
  ["tortilla chips", "corn tortilla chips"],
  ["fritos", "corn chips"],
  ["pepperoni", "sliced pepperoni"],
  ["peanut butter"],
  ["almond butter"],
  ["oats", "rolled oats", "oatmeal", "quick oats"],
  ["granola", "crunchy granola"],
  ["banana", "bananas"],
  ["ground beef", "lean ground beef"],
  ["ground turkey", "lean ground turkey"],
  ["ground pork"],
  ["sweet potato", "sweet potatoes"],
  ["russet potato", "baking potato", "potato", "potatoes"],
  ["deli turkey", "turkey slices"],
  ["deli ham", "ham slices"],
  ["yellow onion", "onion", "onions"],
  ["bell pepper", "bell peppers"],
  ["garlic powder", "granulated garlic"],
  ["garlic", "garlic cloves", "minced garlic"],
];

// Tier 2: Acceptable culinary substitutions that genuinely work in place of the target
const ACCEPTABLE_SUBSTITUTION_GROUPS: Array<{
  terms: string[];
  note: string;
}> = [
  {
    terms: ["jasmine rice", "white rice", "microwave rice", "brown rice"],
    note: "Close rice swap — works directly with the same timing or pouch",
  },
  {
    terms: ["black beans", "pinto beans", "kidney beans"],
    note: "Interchangeable bean option",
  },
  {
    terms: ["cheddar cheese", "mexican blend cheese", "colby jack", "monterey jack"],
    note: "Meltable cheese swap with very similar richness",
  },
  {
    terms: ["mozzarella", "provolone", "italian blend cheese"],
    note: "Mild melting cheese swap",
  },
  {
    terms: ["greek yogurt", "sour cream"],
    note: "Creamy tangy swap (Greek yogurt adds extra protein)",
  },
  {
    terms: ["salsa", "pico de gallo"],
    note: "Fresh vs jarred tomato salsa swap",
  },
  {
    terms: ["sub rolls", "hot dog buns", "hoagie buns", "burger buns"],
    note: "Soft roll/bun swap that holds hot fillings",
  },
  {
    terms: ["naan", "flatbread", "pita", "pita bread"],
    note: "Warm flatbread base swap",
  },
  {
    terms: ["deli turkey", "deli ham", "rotisserie chicken"],
    note: "Pre-cooked deli protein swap",
  },
  {
    terms: ["teriyaki sauce", "soy sauce"],
    note: "Savory Asian sauce swap",
  },
  {
    terms: ["buffalo sauce", "hot sauce", "sriracha"],
    note: "Spicy drizzle swap",
  },
  {
    terms: ["olive oil", "butter", "cooking oil"],
    note: "Cooking fat swap for pan heating",
  },
  {
    terms: ["heavy cream", "half and half", "milk"],
    note: "Dairy liquid swap for sauces",
  },
];

// Tier 3: Related ingredients that are NOT interchangeable equivalents!
// Surfaced for clarity, NEVER counted as "already owned" in pantry.
const RELATED_NOT_EQUIVALENT_GROUPS: Array<{
  terms: string[];
  note: string;
}> = [
  {
    terms: ["ground beef", "ground turkey", "ground pork", "smoked sausage", "kielbasa"],
    note: "Related meat, not equivalent — flavor, cook time, and fat content differ",
  },
  {
    terms: ["pasta", "penne", "rotini", "spaghetti", "macaroni", "tortellini", "ramen", "ramen noodles"],
    note: "Different noodle/pasta style — sauce ratio & cooking differ",
  },
  {
    terms: ["potato", "russet potato", "hashbrowns", "tater tots", "sweet potato"],
    note: "Different starch (sweet potato vs white potato)",
  },
  {
    terms: ["spinach", "baby spinach", "coleslaw", "cabbage", "lettuce", "shredded lettuce", "caesar salad"],
    note: "Different green/veg texture — wilting vs crunchy slaw/salad",
  },
  {
    terms: ["chicken", "rotisserie chicken", "canned tuna", "salmon", "shrimp"],
    note: "Different protein source",
  },
  {
    terms: ["peanut butter", "almond butter"],
    note: "Different nut butter",
  },
  {
    terms: ["marinara", "pasta sauce", "alfredo", "pesto"],
    note: "Different pasta sauce flavor base",
  },
  {
    terms: ["cottage cheese", "shredded cheese", "cheddar", "mozzarella"],
    note: "Different cheese texture (fresh curds vs melting shredded cheese)",
  },
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripQualifiers(norm: string): string {
  return norm
    .replace(
      /\b(fresh|frozen|canned|dried|shredded|diced|sliced|chopped|pre cooked|precooked|jarred|bagged|large|small|medium|boneless|skinless|lean|low sodium|organic|great value|optional)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeToken(word: string): string {
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("oes") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }
  return word;
}

function singularizePhrase(norm: string): string {
  return norm
    .split(" ")
    .filter(Boolean)
    .map(singularizeToken)
    .join(" ");
}

function termMatchesPhrase(phraseNorm: string, term: string): boolean {
  const termNorm = normalizeText(term);
  if (!phraseNorm || !termNorm) return false;
  if (phraseNorm === termNorm) return true;
  if (singularizePhrase(phraseNorm) === singularizePhrase(termNorm)) return true;

  // Prevent compound ingredients from colliding with a shorter embedded word
  if (
    (termNorm === "potato" || termNorm === "potatoes") &&
    /\bsweet potato/.test(phraseNorm)
  ) {
    return false;
  }
  if (termNorm === "pasta" && /\bpasta sauce\b/.test(phraseNorm)) {
    return false;
  }
  if (
    termNorm === "butter" &&
    /\b(peanut|almond|sunflower|cashew|cookie)\s+butter\b/.test(phraseNorm)
  ) {
    return false;
  }

  // Whole-word/sub-phrase boundary match so "rice" doesn't match "licorice" and "ham" doesn't match "champignon"
  const escaped = termNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
  if (regex.test(phraseNorm)) return true;
  const escapedSing = singularizePhrase(termNorm).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escapedSing}(\\s|$)`).test(singularizePhrase(phraseNorm));
}

function areInSameGroup(a: string, b: string, groupTerms: string[]): boolean {
  const aMatch = groupTerms.some((t) => termMatchesPhrase(a, t));
  const bMatch = groupTerms.some((t) => termMatchesPhrase(b, t));
  return aMatch && bMatch;
}

function areRelatedButExplicitlyDistinct(ingNorm: string, pantryNorm: string): {
  isDistinct: boolean;
  note?: string;
} {
  for (const rel of RELATED_NOT_EQUIVALENT_GROUPS) {
    // Check which specific term matched each
    const ingMatches = rel.terms.filter((t) => termMatchesPhrase(ingNorm, t));
    const pantryMatches = rel.terms.filter((t) => termMatchesPhrase(pantryNorm, t));
    if (ingMatches.length > 0 && pantryMatches.length > 0) {
      // Check if BOTH belong to the exact same Tier 1 group — if so, they ARE equivalent (e.g., penne & rotini)
      const sameExactGroup = EXACT_EQUIVALENT_GROUPS.some((g) =>
        areInSameGroup(ingNorm, pantryNorm, g)
      );
      if (!sameExactGroup) {
        return { isDistinct: true, note: rel.note };
      }
    }
  }
  return { isDistinct: false };
}

export function classifyIngredientAgainstPantryName(
  ingredient: MealIngredient,
  pantryName: string
): { tier: PantryMatchTier; note?: string } {
  const ingRaw = normalizeText(ingredient.item);
  const pantryRaw = normalizeText(pantryName);
  if (!ingRaw || !pantryRaw) return { tier: "none" };

  // Handle combined pantry strings like "Rotisserie / Grilled Chicken" or "Ground Beef / Turkey"
  const pantryVariants = pantryName
    .split(/[\/,]|\bor\b/i)
    .map((v) => normalizeText(v))
    .filter((v) => v.length >= 2);
  const ingVariants = ingredient.item
    .split(/\(.*?\)|[\/]|\bor\b/i)
    .map((v) => normalizeText(v))
    .filter((v) => v.length >= 2);

  const candidatesIng = ingVariants.length > 0 ? [ingRaw, ...ingVariants] : [ingRaw];
  const candidatesPantry = pantryVariants.length > 0 ? [pantryRaw, ...pantryVariants] : [pantryRaw];

  // Check if ingredient itself is "Ground beef or ground turkey" (accepts either!)
  const ingAllowsOr = /\bor\b|\//.test(ingredient.item);

  // 1. Strict equality & explicit Tier 1 equivalent groups
  for (const ingV of candidatesIng) {
    for (const panV of candidatesPantry) {
      const ingSing = singularizePhrase(ingV);
      const panSing = singularizePhrase(panV);
      const ingCore = singularizePhrase(stripQualifiers(ingV));
      const panCore = singularizePhrase(stripQualifiers(panV));

      if (
        ingV === panV ||
        ingSing === panSing ||
        (ingCore.length >= 3 && panCore.length >= 3 && ingCore === panCore)
      ) {
        return { tier: "exact" };
      }

      // Check Tier 1 EXACT_EQUIVALENT_GROUPS (skip if related-but-distinct overrides)
      const distinctCheck = areRelatedButExplicitlyDistinct(ingV, panV);
      if (!distinctCheck.isDistinct) {
        for (const group of EXACT_EQUIVALENT_GROUPS) {
          if (areInSameGroup(ingV, panV, group)) {
            return { tier: "exact" };
          }
        }
      }
    }
  }

  // If ingredient explicitly says "X or Y", match either branch individually
  if (ingAllowsOr) {
    for (const ingV of ingVariants) {
      for (const panV of candidatesPantry) {
        const distinctCheck = areRelatedButExplicitlyDistinct(ingV, panV);
        if (distinctCheck.isDistinct) continue;
        for (const group of EXACT_EQUIVALENT_GROUPS) {
          if (areInSameGroup(ingV, panV, group)) {
            return { tier: "exact" };
          }
        }
      }
    }
  }

  // Explicit Tier 3 guard before general word containment
  for (const ingV of candidatesIng) {
    for (const panV of candidatesPantry) {
      const distinctCheck = areRelatedButExplicitlyDistinct(ingV, panV);
      if (distinctCheck.isDistinct) {
        return { tier: "related_not_equivalent", note: distinctCheck.note };
      }
    }
  }

  // Safe multi-word / direct containment match when terms are not in distinct conflict
  for (const ingV of candidatesIng) {
    for (const panV of candidatesPantry) {
      const panWords = panV.split(" ").filter((w) => w.length >= 4);
      const ingWords = ingV.split(" ").filter((w) => w.length >= 4);
      if (
        (panWords.length > 0 && panWords.every((w) => termMatchesPhrase(ingV, w))) ||
        (ingWords.length > 0 && ingWords.every((w) => termMatchesPhrase(panV, w)))
      ) {
        const distinctAgain = areRelatedButExplicitlyDistinct(ingV, panV);
        if (distinctAgain.isDistinct) {
          return { tier: "related_not_equivalent", note: distinctAgain.note };
        }
        return { tier: "exact" };
      }
    }
  }

  // 2. Check Tier 2 Acceptable Substitutions
  for (const ingV of candidatesIng) {
    for (const panV of candidatesPantry) {
      for (const sub of ACCEPTABLE_SUBSTITUTION_GROUPS) {
        if (areInSameGroup(ingV, panV, sub.terms)) {
          return { tier: "substitution", note: sub.note };
        }
      }
    }
  }

  // 3. Check Tier 3 Related Not Equivalent on full strings too
  const fullDistinct = areRelatedButExplicitlyDistinct(ingRaw, pantryRaw);
  if (fullDistinct.isDistinct) {
    return { tier: "related_not_equivalent", note: fullDistinct.note };
  }

  return { tier: "none" };
}

/**
 * Checks whether a pantry item's numeric quantity satisfies explicit countable container units
 * (e.g. "2 cans black beans", "2 pouches microwave rice", "3 eggs") when practical.
 */
export function checkIngredientQuantitySufficiency(
  amountText: string,
  pantryQuantity: number
): { sufficient: boolean; requiredUnits?: number; note?: string } {
  if (!Number.isFinite(pantryQuantity) || pantryQuantity <= 0) {
    return { sufficient: false, note: "Quantity is 0 in pantry" };
  }

  const lower = amountText.toLowerCase();
  // Match explicit discrete container/unit counts like "2 cans", "2 pouches", "3 tortillas", "2 bags", "2 flatbreads"
  const containerMatch = lower.match(
    /^\s*(\d+(?:\.\d+)?)\s*(?:-\s*\d+\s*)?(cans?|pouch(?:es)?|bags?|packages?|packs?|jars?|box(?:es)?|links?|bottles?|cups?\s+dry|flatbreads?)\b/i
  );
  if (containerMatch) {
    const required = Math.ceil(Number(containerMatch[1]));
    if (Number.isFinite(required) && required > 1 && pantryQuantity < required) {
      return {
        sufficient: false,
        requiredUnits: required,
        note: `Have ${pantryQuantity}, recipe needs ${required}`,
      };
    }
  }

  return { sufficient: true };
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

export function resolveIngredientWithPantry(
  ingredient: MealIngredient,
  pantryItems: PantryItem[]
): IngredientPantryResolution {
  let bestSub: { item: PantryItem; note?: string } | null = null;
  let bestRelated: { item: PantryItem; note?: string } | null = null;

  for (const item of pantryItems) {
    if (item.quantity <= 0) continue;
    const classified = classifyIngredientAgainstPantryName(ingredient, item.name);
    if (classified.tier === "exact") {
      const qtyCheck = checkIngredientQuantitySufficiency(ingredient.amount, item.quantity);
      return {
        ingredient,
        tier: "exact",
        matchedItem: item,
        hasInPantry: true,
        quantitySufficient: qtyCheck.sufficient,
        note: qtyCheck.note,
      };
    }
    if (classified.tier === "substitution" && !bestSub) {
      bestSub = { item, note: classified.note };
    } else if (classified.tier === "related_not_equivalent" && !bestRelated) {
      bestRelated = { item, note: classified.note };
    }
  }

  if (bestSub) {
    const qtyCheck = checkIngredientQuantitySufficiency(
      ingredient.amount,
      bestSub.item.quantity
    );
    return {
      ingredient,
      tier: "substitution",
      matchedItem: bestSub.item,
      hasInPantry: true,
      quantitySufficient: qtyCheck.sufficient,
      note: qtyCheck.note || bestSub.note,
    };
  }

  if (bestRelated) {
    return {
      ingredient,
      tier: "related_not_equivalent",
      matchedItem: bestRelated.item,
      hasInPantry: false, // Explicitly NOT counted as owned!
      quantitySufficient: false,
      note: bestRelated.note,
    };
  }

  return {
    ingredient,
    tier: "none",
    matchedItem: null,
    hasInPantry: false,
    quantitySufficient: false,
  };
}

export function singleIngredientMatchesPantryName(
  ingredient: MealIngredient,
  pantryName: string
): boolean {
  const res = classifyIngredientAgainstPantryName(ingredient, pantryName);
  return res.tier === "exact" || res.tier === "substitution";
}

export function findMatchingPantryItem(
  ingredient: MealIngredient,
  pantryItems: PantryItem[]
): PantryItem | null {
  const res = resolveIngredientWithPantry(ingredient, pantryItems);
  return res.hasInPantry ? res.matchedItem : null;
}

export function ingredientMatchesPantry(
  ingredient: MealIngredient,
  pantryItems: PantryItem[]
): boolean {
  return findMatchingPantryItem(ingredient, pantryItems) !== null;
}

export function evaluateMealIngredients(meal: Meal, pantryItems: PantryItem[]) {
  const resolutions = meal.ingredients.map((ing) =>
    resolveIngredientWithPantry(ing, pantryItems)
  );
  const owned = resolutions.filter((r) => r.tier === "exact");
  const substituted = resolutions.filter((r) => r.tier === "substitution");
  const relatedOnly = resolutions.filter((r) => r.tier === "related_not_equivalent");
  const missing = resolutions.filter((r) => !r.hasInPantry);
  const quantityWarnings = resolutions.filter((r) => r.hasInPantry && !r.quantitySufficient);

  const matchCount = owned.length + substituted.length;
  const totalCount = meal.ingredients.length;
  const ratio = totalCount > 0 ? matchCount / totalCount : 0;

  return {
    resolutions,
    owned,
    substituted,
    relatedOnly,
    missing,
    quantityWarnings,
    matchCount,
    exactCount: owned.length,
    substitutionCount: substituted.length,
    totalCount,
    ratio,
    matchedIngredients: resolutions.map((r) => r.hasInPantry),
    isFullMatch: totalCount > 0 && matchCount === totalCount && quantityWarnings.length === 0,
  };
}

export function getPantryMatchStats(meal: Meal, pantryItems: PantryItem[]) {
  const evalResult = evaluateMealIngredients(meal, pantryItems);
  return {
    matchCount: evalResult.matchCount,
    exactCount: evalResult.exactCount,
    substitutionCount: evalResult.substitutionCount,
    totalCount: evalResult.totalCount,
    ratio: evalResult.ratio,
    matchedIngredients: evalResult.matchedIngredients,
    resolutions: evalResult.resolutions,
    relatedOnlyCount: evalResult.relatedOnly.length,
    quantityWarningCount: evalResult.quantityWarnings.length,
    isFullMatch: evalResult.isFullMatch,
  };
}

export function getMissingIngredients(
  meal: Meal,
  pantryItems: PantryItem[]
): MealIngredient[] {
  return evaluateMealIngredients(meal, pantryItems).missing.map(
    (r) => r.ingredient
  );
}

const FROZEN_TEXT_REGEX = /\bfrozen\b|\bfreezer\b/i;

export function mealRequiresFreezer(meal: Meal): boolean {
  if (meal.requiresFreezer === true) return true;
  return meal.ingredients.some(
    (ing) => ing.walmartAisle === "Frozen" || FROZEN_TEXT_REGEX.test(ing.item)
  );
}

export function isMealAllowedInKitchenMode(
  meal: Meal,
  kitchenModeOrProfile: KitchenMode | KitchenProfile,
  noFreezer = false
): boolean {
  if (typeof kitchenModeOrProfile === "string") {
    const baseProfile = createProfileForEnvironment(
      kitchenModeOrProfile === "full_kitchen" ? "full_kitchen" : "microwave_only"
    );
    const effectiveProfile: KitchenProfile = {
      ...baseProfile,
      hasFreezer: !noFreezer && baseProfile.hasFreezer,
      equipment: noFreezer
        ? baseProfile.equipment.filter((e) => e !== "freezer")
        : baseProfile.equipment,
    };
    return isMealEquipmentCompatible(meal, effectiveProfile).compatible;
  }

  return isMealEquipmentCompatible(meal, kitchenModeOrProfile).compatible;
}

export function getMealRequiredEquipmentSummary(meal: Meal): CookingEquipment[] {
  return inferMealRequirements(meal).requiredEquipment;
}
