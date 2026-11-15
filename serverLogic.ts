import fs from "fs";
import os from "os";
import path from "path";
import { Type } from "@google/genai";
import {
  CookingEffort,
  CookingEnvironment,
  CookingEquipment,
  DietaryRestriction,
  DormConstraints,
  KitchenProfile,
  LivingSituation,
  Meal,
  MealType,
  PantryItem,
  SharedKitchenPreference,
  VarietyPreference,
} from "./src/types";
import {
  EFFORT_PRESETS,
  createProfileForEnvironment,
  getEffectiveEquipment,
  isMealDormCompatible,
  isMealEquipmentCompatible,
  normalizeDormConstraints,
} from "./src/utils/kitchenProfile";
import { evaluateMealIngredients } from "./src/utils/pantryMatch";
import { getMealExtras } from "./src/utils/mealExtras";

export const MAX_ARRAY_ITEMS = 25;
export const MAX_ITEM_CHARS = 100;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 20;

const VALID_ENVIRONMENTS = new Set<CookingEnvironment>([
  "full_kitchen",
  "microwave_only",
  "microwave_mini_fridge",
  "limited_kitchen",
  "custom",
]);

const VALID_EQUIPMENT = new Set<CookingEquipment>([
  "stove",
  "oven",
  "microwave",
  "toaster",
  "air_fryer",
  "fridge",
  "freezer",
  "other",
]);

const VALID_EFFORTS = new Set<CookingEffort>([
  "very_low",
  "low",
  "moderate",
  "normal",
]);

const VALID_VARIETIES = new Set<VarietyPreference>([
  "familiar",
  "balanced",
  "new_ideas",
]);

const VALID_MEAL_TYPES = new Set<MealType>([
  "any",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

const VALID_DIETARY = new Set<DietaryRestriction>([
  "vegetarian",
  "gluten_free",
  "dairy_free",
  "high_protein",
]);

export function validateStringArrayInput(
  raw: unknown
): { ok: true; items: string[] } | { ok: false } {
  if (raw === undefined) {
    return { ok: true, items: [] };
  }
  if (!Array.isArray(raw)) {
    return { ok: false };
  }
  for (const entry of raw) {
    if (typeof entry !== "string") {
      return { ok: false };
    }
  }
  const sanitized = raw
    .slice(0, MAX_ARRAY_ITEMS)
    .map((s) => s.trim().slice(0, MAX_ITEM_CHARS))
    .filter((s) => s.length > 0);
  return { ok: true, items: sanitized };
}

export interface NormalizedGenerationRequest {
  profile: KitchenProfile;
  pantryItems: string[];
  lessFrequentMeals: string[];
  existingTitles: string[];
  ingredients: string[];
  mealType: MealType;
  missingPreference: "pantry_only" | "minimal_missing" | "allow_missing";
  maxPrepMinutes: number;
  maxCookMinutes: number;
  upgradeTarget: string;
  energyNote: string;
}

export function normalizeGenerationRequest(
  body: Record<string, unknown>
): { ok: true; value: NormalizedGenerationRequest } | { ok: false; error: string } {
  const rutParsed = validateStringArrayInput(body.lessFrequentMeals ?? body.rutMeals);
  const existingParsed = validateStringArrayInput(body.existingTitles);
  const pantryParsed = validateStringArrayInput(body.pantryItems);
  const ingredientsParsed = validateStringArrayInput(body.ingredients);

  if (!rutParsed.ok || !existingParsed.ok || !pantryParsed.ok || !ingredientsParsed.ok) {
    return { ok: false, error: "Invalid request parameters." };
  }

  const rawProfile =
    body.kitchenProfile && typeof body.kitchenProfile === "object"
      ? (body.kitchenProfile as Record<string, unknown>)
      : {};

  // Determine environment with safe fallback and legacy compatibility
  let environment: CookingEnvironment = "full_kitchen";
  if (
    typeof rawProfile.environment === "string" &&
    VALID_ENVIRONMENTS.has(rawProfile.environment as CookingEnvironment)
  ) {
    environment = rawProfile.environment as CookingEnvironment;
  } else if (body.kitchenMode === "microwave_only") {
    environment = body.noFreezer === true ? "microwave_only" : "microwave_mini_fridge";
  } else if (body.kitchenMode === "full_kitchen") {
    environment = "full_kitchen";
  }

  let equipment: CookingEquipment[] | undefined;
  if (Array.isArray(rawProfile.equipment)) {
    const filtered = rawProfile.equipment.filter(
      (e): e is CookingEquipment =>
        typeof e === "string" && VALID_EQUIPMENT.has(e as CookingEquipment)
    );
    equipment = Array.from(new Set(filtered));
  }

  const hasFreezerOverride =
    typeof rawProfile.hasFreezer === "boolean"
      ? rawProfile.hasFreezer
      : typeof body.noFreezer === "boolean"
      ? !body.noFreezer
      : undefined;

  let effort: CookingEffort = "low";
  if (
    typeof rawProfile.effort === "string" &&
    VALID_EFFORTS.has(rawProfile.effort as CookingEffort)
  ) {
    effort = rawProfile.effort as CookingEffort;
  } else if (
    typeof body.effort === "string" &&
    VALID_EFFORTS.has(body.effort as CookingEffort)
  ) {
    effort = body.effort as CookingEffort;
  }

  const varietyPreference: VarietyPreference =
    typeof rawProfile.varietyPreference === "string" &&
    VALID_VARIETIES.has(rawProfile.varietyPreference as VarietyPreference)
      ? (rawProfile.varietyPreference as VarietyPreference)
      : "balanced";

  const dietaryRaw = Array.isArray(rawProfile.dietaryRestrictions)
    ? rawProfile.dietaryRestrictions
    : Array.isArray(body.dietaryRestrictions)
    ? body.dietaryRestrictions
    : [];
  const dietaryRestrictions = Array.from(
    new Set(
      dietaryRaw.filter(
        (d): d is DietaryRestriction =>
          typeof d === "string" && VALID_DIETARY.has(d as DietaryRestriction)
      )
    )
  );

  const livingSituation: LivingSituation =
    rawProfile.livingSituation === "dorm" ? "dorm" : "standard";

  const rawDorm =
    rawProfile.dormConstraints && typeof rawProfile.dormConstraints === "object"
      ? (rawProfile.dormConstraints as Partial<DormConstraints>)
      : undefined;
  const dormConstraints = normalizeDormConstraints(livingSituation, {
    limitedFridgeSpace: typeof rawDorm?.limitedFridgeSpace === "boolean" ? rawDorm.limitedFridgeSpace : undefined,
    limitedFreezerSpace: typeof rawDorm?.limitedFreezerSpace === "boolean" ? rawDorm.limitedFreezerSpace : undefined,
    limitedFoodStorage: typeof rawDorm?.limitedFoodStorage === "boolean" ? rawDorm.limitedFoodStorage : undefined,
    limitedCounterSpace: typeof rawDorm?.limitedCounterSpace === "boolean" ? rawDorm.limitedCounterSpace : undefined,
    sharedAppliances: typeof rawDorm?.sharedAppliances === "boolean" ? rawDorm.sharedAppliances : undefined,
    minimalCookware: typeof rawDorm?.minimalCookware === "boolean" ? rawDorm.minimalCookware : undefined,
    preferShelfStable: typeof rawDorm?.preferShelfStable === "boolean" ? rawDorm.preferShelfStable : undefined,
    smallerQuantities: typeof rawDorm?.smallerQuantities === "boolean" ? rawDorm.smallerQuantities : undefined,
  });

  const sharedKitchen: SharedKitchenPreference =
    rawProfile.sharedKitchen === "available_use" ||
    rawProfile.sharedKitchen === "available_avoid"
      ? rawProfile.sharedKitchen
      : "none";

  const otherEquipmentLabel =
    typeof rawProfile.otherEquipmentLabel === "string"
      ? rawProfile.otherEquipmentLabel.trim().slice(0, 60)
      : "";

  const baseProfile = createProfileForEnvironment(environment, {
    equipment,
    hasFreezer: hasFreezerOverride,
    effort,
    varietyPreference,
    dietaryRestrictions,
    livingSituation,
    dormConstraints,
    sharedKitchen,
    otherEquipmentLabel,
  });

  if (hasFreezerOverride !== undefined) {
    baseProfile.hasFreezer = hasFreezerOverride;
    if (hasFreezerOverride && !baseProfile.equipment.includes("freezer")) {
      baseProfile.equipment = [...baseProfile.equipment, "freezer"];
    } else if (!hasFreezerOverride) {
      baseProfile.equipment = baseProfile.equipment.filter((e) => e !== "freezer");
    }
  }

  const mealType: MealType =
    typeof body.mealType === "string" && VALID_MEAL_TYPES.has(body.mealType as MealType)
      ? (body.mealType as MealType)
      : "any";

  const missingPreference: NormalizedGenerationRequest["missingPreference"] =
    body.missingPreference === "pantry_only" ||
    body.missingPreference === "minimal_missing" ||
    body.missingPreference === "allow_missing"
      ? body.missingPreference
      : "allow_missing";

  const defaultPrep =
    effort === "very_low" ? 5 : effort === "low" ? 8 : effort === "moderate" ? 15 : 25;
  const defaultCook =
    effort === "very_low" ? 5 : effort === "low" ? 12 : effort === "moderate" ? 22 : 45;

  const maxPrepMinutes =
    typeof body.maxPrepMinutes === "number" && Number.isFinite(body.maxPrepMinutes)
      ? Math.max(0, Math.min(90, Math.round(body.maxPrepMinutes)))
      : defaultPrep;

  const maxCookMinutes =
    typeof body.maxCookMinutes === "number" && Number.isFinite(body.maxCookMinutes)
      ? Math.max(0, Math.min(120, Math.round(body.maxCookMinutes)))
      : typeof body.timeLimit === "number" && Number.isFinite(body.timeLimit)
      ? Math.max(2, Math.min(120, Math.round(body.timeLimit)))
      : defaultCook;

  const upgradeTarget =
    typeof body.upgradeTarget === "string" ? body.upgradeTarget.trim().slice(0, 100) : "";

  const energyNote =
    typeof body.energyLevel === "string" ? body.energyLevel.trim().slice(0, 60) : "";

  return {
    ok: true,
    value: {
      profile: baseProfile,
      pantryItems: pantryParsed.items,
      lessFrequentMeals: rutParsed.items,
      existingTitles: existingParsed.items,
      ingredients: ingredientsParsed.items,
      mealType,
      missingPreference,
      maxPrepMinutes,
      maxCookMinutes,
      upgradeTarget,
      energyNote,
    },
  };
}

export function getIngredientBoundsForEffort(effort: CookingEffort): {
  min: number;
  max: number;
  stepCap: number;
  guidance: string;
} {
  const preset = EFFORT_PRESETS[effort];
  return {
    min: preset.ingredientRange.min,
    max: preset.ingredientRange.max,
    stepCap: preset.maxSteps,
    guidance:
      effort === "very_low"
        ? "VERY LOW EFFORT: Use 2 to 5 standard Walmart ingredients total. Zero chopping or tricky prep, max 3-4 fast steps."
        : effort === "low"
        ? "LOW EFFORT: Use 3 to 7 accessible Walmart ingredients total. Simple assembly or single-vessel cooking, max 4 clear steps."
        : effort === "moderate"
        ? "MODERATE EFFORT: Use 4 to 9 ingredients. Light chopping, whisking sauces, or multi-step cooking is welcome across 3-6 steps."
        : "NORMAL COOKING: Ingredient count is flexible (5 to 14 ingredients welcome). Traditional home-cooked scratch recipes, aromatics, and proper baking/searing/simmering across 4-7 steps are encouraged.",
  };
}

export function buildEquipmentPromptRules(profile: KitchenProfile): string {
  const owned = getEffectiveEquipment(profile);
  const equipmentLabels = Array.from(owned).map((eq) =>
    eq === "other" && profile.otherEquipmentLabel
      ? `other (${profile.otherEquipmentLabel})`
      : eq.replace(/_/g, " ")
  );
  const availableList =
    equipmentLabels.length > 0 ? equipmentLabels.join(", ") : "no cooking appliances (assembly only)";

  const forbidden: string[] = [];
  if (!owned.has("stove")) forbidden.push("stovetop", "skillet", "frying pan", "burner", "boil in a pot");
  if (!owned.has("oven")) forbidden.push("oven", "preheat oven", "baking sheet", "sheet pan", "broiler");
  if (!owned.has("toaster")) forbidden.push("toaster", "toaster oven");
  if (!owned.has("air_fryer")) forbidden.push("air fryer");
  if (!owned.has("microwave")) forbidden.push("microwave");
  if (!owned.has("fridge")) forbidden.push("refrigerated items requiring cold storage");
  if (!owned.has("freezer")) forbidden.push("frozen foods (no frozen veggies, frozen meatballs, frozen fries, etc.)");
  forbidden.push("electric kettle", "hot plate");

  const lines = [
    `AVAILABLE EQUIPMENT: ${availableList}. Freezer available: ${owned.has("freezer") ? "YES" : "NO"}.`,
    `STRICT EQUIPMENT RULE: Every cooking step MUST ONLY use equipment listed above (or zero-heat assembly). NEVER mention or require: ${forbidden.join(", ")}.`,
  ];

  if (!owned.has("fridge") && owned.has("microwave")) {
    lines.push(
      "NO REFRIGERATOR: Prioritize shelf-stable pantry items (canned beans/chili, microwave rice pouches, tear-open chicken or tuna pouches, peanut butter, tortillas, ramen, pasta cooked by absorption in a microwave bowl, oats, shelf-stable jars) and never rely on chilled ingredients or leftovers."
    );
  }
  if (!owned.has("freezer")) {
    lines.push(
      "NO FREEZER: Zero frozen ingredients allowed anywhere in ingredients, optional add-ons, or side pairings."
    );
  }
  if (profile.livingSituation === "dorm") {
    const dc = profile.dormConstraints;
    const dormNotes: string[] = [];
    if (dc?.minimalCookware && profile.sharedKitchen !== "available_use") {
      dormNotes.push("minimal cookware only (microwave-safe mug/bowl/plate only — NO colanders, strainers, pots, pans, or baking sheets)");
    }
    if (dc?.preferShelfStable) {
      dormNotes.push("favor shelf-stable dorm items that store safely in a drawer or bin");
    }
    if (dc?.smallerQuantities || dc?.limitedFoodStorage) {
      dormNotes.push("use compact, single-serving or small-batch quantities");
    }
    if (dc?.limitedCounterSpace) {
      dormNotes.push("minimal prep space (avoid sprawling multi-board prep)");
    }
    if (profile.sharedKitchen === "available_avoid") {
      dormNotes.push("user has a shared hall kitchen but prefers to cook right in their dorm room");
    } else if (profile.sharedKitchen === "available_use") {
      dormNotes.push("user is okay using shared dorm kitchen stove/oven");
    }
    if (dormNotes.length > 0) {
      lines.push(`DORM LIVING CONTEXT: ${dormNotes.join("; ")}.`);
    }
  }
  if (profile.dietaryRestrictions.length > 0) {
    lines.push(
      `STRICT DIETARY RESTRICTIONS: Must comply 100% with: ${profile.dietaryRestrictions.join(", ").replace(/_/g, " ")}.`
    );
  }

  return lines.join("\n");
}

export function buildAdaptiveRecipePrompt(
  req: NormalizedGenerationRequest,
  styleLabel: string
): string {
  const {
    profile,
    pantryItems,
    lessFrequentMeals,
    existingTitles,
    mealType,
    missingPreference,
    maxPrepMinutes,
    maxCookMinutes,
    upgradeTarget,
  } = req;

  const bounds = getIngredientBoundsForEffort(profile.effort);
  const equipmentRules = buildEquipmentPromptRules(profile);

  const pantryInstruction =
    pantryItems.length > 0
      ? missingPreference === "pantry_only"
        ? `PANTRY-FIRST STRICT MODE: Use ONLY ingredients from the user's available inventory (${pantryItems.join(", ")}) plus basic water/salt/pepper. Do NOT require extra grocery store items.`
        : missingPreference === "minimal_missing"
        ? `PANTRY-FIRST MODE: Base the meal around items the user already owns (${pantryItems.join(", ")}) and require at most 1-2 quick missing Walmart items.`
        : `AVAILABLE INGREDIENTS: User owns: ${pantryItems.join(", ")}. Prioritize using relevant owned items cleanly, and list any remaining items honestly in missingIngredients.`
      : "User has not listed pantry items yet — use accessible, budget-friendly Walmart ingredients matching their equipment and effort.";

  const varietyInstruction = upgradeTarget
    ? `COMFORT VARIATION REQUEST: The user enjoys "${upgradeTarget}". There is nothing wrong with eating "${upgradeTarget}" as-is; offer a delicious, approachable variation or optional upgrade using their available equipment and effort level without any shaming language.`
    : profile.varietyPreference === "familiar"
    ? "MEAL STYLE PREFERENCE: Prioritize familiar, approachable comfort classics and crowd-pleasers."
    : profile.varietyPreference === "new_ideas"
    ? `MEAL STYLE PREFERENCE: Suggest a fresh, distinct new meal idea. User asked to see these less frequently: ${lessFrequentMeals.join(", ") || "none"}.`
    : `MEAL STYLE PREFERENCE: Offer a welcoming, balanced meal idea. Optionally note if it's a fun twist on comfort favorites. Items user prefers less often: ${lessFrequentMeals.join(", ") || "none"}.`;

  return `
You are Simple Chef, an adaptive meal-planning and cooking assistant.
Never shame or lecture the user about their food habits. Be practical, encouraging, and clear.

USER CONTEXT:
- Cooking Environment: ${profile.environment}
- ${equipmentRules}
- Desired Effort Level: ${profile.effort} -> ${bounds.guidance}
- Max Prep Time: ${maxPrepMinutes} min | Max Cook Time: ${maxCookMinutes} min
- Meal Type: ${mealType === "any" ? "flexible (lunch, dinner, or breakfast)" : mealType}
- Style Direction: ${styleLabel}
- ${pantryInstruction}
- ${varietyInstruction}
- Existing titles NOT to duplicate: ${existingTitles.join(", ") || "none"}

STEP & INGREDIENT CLARITY RULES:
1. Respect the ingredient count guideline (${bounds.min}–${bounds.max} ingredients, max ${bounds.stepCap} steps).
2. State the ingredient name and measurement right inside each instruction step sentence so the cook doesn't have to flip back and forth.
3. Populate ownedIngredients, missingIngredients, optionalIngredients, and possibleSubstitutions honestly based ONLY on the user's actual pantry list (never pretend ground beef is ground turkey, or ramen is penne).
4. Include 2 optionalAddons and 2 sidePairings that ALSO strictly obey the available equipment and freezer rules!
`.trim();
}

export const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Clear, appetizing meal title" },
    tagline: { type: Type.STRING, description: "One crisp sentence describing what the dish is" },
    prepMinutes: { type: Type.INTEGER },
    cookMinutes: { type: Type.INTEGER },
    effortLevel: {
      type: Type.STRING,
      description: "One of: very_low, low, moderate, normal",
    },
    mealType: {
      type: Type.STRING,
      description: "One of: breakfast, lunch, dinner, snack",
    },
    requiredEquipment: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Equipment used from: stove, oven, microwave, toaster, air_fryer, fridge, freezer",
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          amount: { type: Type.STRING },
          walmartAisle: {
            type: Type.STRING,
            description:
              "Produce, Meat & Deli, Dairy & Eggs, Pantry / Canned, Frozen, Bakery, or Spices & Condiments",
          },
          tip: { type: Type.STRING },
          optional: { type: Type.BOOLEAN },
        },
        required: ["item", "amount", "walmartAisle"],
      },
    },
    ownedIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Ingredients already covered by user's pantry list",
    },
    missingIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Ingredients the user would need to buy",
    },
    optionalIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    possibleSubstitutions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          timerSeconds: { type: Type.INTEGER },
        },
        required: ["stepNumber", "title", "instruction"],
      },
    },
    whyItWorks: { type: Type.STRING },
    rutAlternativeNote: {
      type: Type.STRING,
      description: "Helpful positive note on flavor/nutrition or comfort variation (no shaming)",
    },
    optionalAddons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          howToUse: { type: Type.STRING },
          walmartAisle: { type: Type.STRING },
        },
        required: ["item", "howToUse", "walmartAisle"],
      },
    },
    sidePairings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          howToUse: { type: Type.STRING },
          walmartAisle: { type: Type.STRING },
        },
        required: ["item", "howToUse", "walmartAisle"],
      },
    },
  },
  required: [
    "title",
    "tagline",
    "prepMinutes",
    "cookMinutes",
    "ingredients",
    "instructions",
    "whyItWorks",
    "rutAlternativeNote",
    "optionalAddons",
    "sidePairings",
  ],
};

/**
 * Verifies AI output strictly complies with requested equipment/freezer constraints and
 * deterministically recomputes owned/missing/substitution lists using 3-tier pantryMatch.
 */
export function finalizeAndVerifyGeneratedMeal(
  rawMeal: Record<string, unknown>,
  profile: KitchenProfile,
  pantryStrings: string[],
  fallbackCategory: Meal["category"]
): Meal | null {
  if (!rawMeal || typeof rawMeal.title !== "string" || !Array.isArray(rawMeal.instructions)) {
    return null;
  }

  const ingredients = Array.isArray(rawMeal.ingredients) ? rawMeal.ingredients : [];
  if (ingredients.length === 0 || rawMeal.instructions.length === 0) return null;

  const validEffort: CookingEffort =
    typeof rawMeal.effortLevel === "string" &&
    VALID_EFFORTS.has(rawMeal.effortLevel as CookingEffort)
      ? (rawMeal.effortLevel as CookingEffort)
      : profile.effort;

  const allowedMealType =
    typeof rawMeal.mealType === "string" &&
    ["breakfast", "lunch", "dinner", "snack"].includes(rawMeal.mealType)
      ? (rawMeal.mealType as Meal["mealType"])
      : undefined;

  const reqEq = Array.isArray(rawMeal.requiredEquipment)
    ? rawMeal.requiredEquipment.filter(
        (e): e is CookingEquipment =>
          typeof e === "string" && VALID_EQUIPMENT.has(e as CookingEquipment)
      )
    : undefined;

  const candidate: Meal = {
    id: `ai-${Date.now()}`,
    title: rawMeal.title.trim().slice(0, 120),
    tagline:
      typeof rawMeal.tagline === "string" ? rawMeal.tagline.trim().slice(0, 300) : "",
    prepMinutes:
      typeof rawMeal.prepMinutes === "number" && Number.isFinite(rawMeal.prepMinutes)
        ? Math.max(0, Math.min(180, Math.round(rawMeal.prepMinutes)))
        : 5,
    cookMinutes:
      typeof rawMeal.cookMinutes === "number" && Number.isFinite(rawMeal.cookMinutes)
        ? Math.max(0, Math.min(180, Math.round(rawMeal.cookMinutes)))
        : 5,
    category: fallbackCategory,
    effortLevel: validEffort,
    ...(reqEq && reqEq.length > 0 ? { requiredEquipment: reqEq } : {}),
    ...(allowedMealType ? { mealType: allowedMealType } : {}),
    ingredients: ingredients.slice(0, 16) as Meal["ingredients"],
    instructions: rawMeal.instructions.slice(0, 10) as Meal["instructions"],
    whyItWorks:
      typeof rawMeal.whyItWorks === "string" ? rawMeal.whyItWorks.trim().slice(0, 400) : "",
    rutAlternativeNote:
      typeof rawMeal.rutAlternativeNote === "string"
        ? rawMeal.rutAlternativeNote.trim().slice(0, 400)
        : "",
    optionalAddons: Array.isArray(rawMeal.optionalAddons)
      ? (rawMeal.optionalAddons as Meal["optionalAddons"])
      : undefined,
    sidePairings: Array.isArray(rawMeal.sidePairings)
      ? (rawMeal.sidePairings as Meal["sidePairings"])
      : undefined,
    optionalIngredients: Array.isArray(rawMeal.optionalIngredients)
      ? rawMeal.optionalIngredients.filter((s): s is string => typeof s === "string").slice(0, 8)
      : undefined,
    possibleSubstitutions: Array.isArray(rawMeal.possibleSubstitutions)
      ? rawMeal.possibleSubstitutions.filter((s): s is string => typeof s === "string").slice(0, 8)
      : undefined,
  };

  // Enforce hardware/equipment and dorm cookware compatibility strictly
  const compat = isMealEquipmentCompatible(candidate, profile);
  if (!compat.compatible) {
    return null;
  }
  const dormCompat = isMealDormCompatible(candidate, profile);
  if (!dormCompat.compatible) {
    return null;
  }

  // Strip incompatible extras (e.g. toaster oven sides for microwave-only users)
  const effectiveOwned = getEffectiveEquipment(profile);
  const filteredExtras = getMealExtras(candidate, {
    equipment: Array.from(effectiveOwned),
    hasFreezer: effectiveOwned.has("freezer"),
  });
  candidate.optionalAddons = filteredExtras.addons;
  candidate.sidePairings = filteredExtras.sides;

  // Deterministically compute accurate owned vs missing vs possibleSubstitutions from real pantry
  const pantryObjects: PantryItem[] = pantryStrings.map((name) => ({ name, quantity: 1 }));
  if (pantryObjects.length > 0) {
    const evalRes = evaluateMealIngredients(candidate, pantryObjects);
    candidate.ownedIngredients = evalRes.owned.map((r) => r.ingredient.item);
    candidate.missingIngredients = evalRes.missing.map((r) => r.ingredient.item);
    const derivedSubs = [
      ...evalRes.substituted.map(
        (r) => `${r.ingredient.item} -> use your ${r.matchedItem?.name}`
      ),
      ...(candidate.possibleSubstitutions || []),
    ];
    candidate.possibleSubstitutions = Array.from(new Set(derivedSubs)).slice(0, 8);
  } else {
    candidate.ownedIngredients = [];
    candidate.missingIngredients = candidate.ingredients.map((i) => i.item);
  }

  return candidate;
}

/**
 * File-backed sliding-window rate limiter so limits survive server restarts and work per IP + optional client UID.
 */
export class PersistentRateLimiter {
  private store = new Map<string, number[]>();
  private readonly filePath: string;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(options?: {
    filePath?: string;
    windowMs?: number;
    maxRequests?: number;
  }) {
    this.filePath =
      options?.filePath || path.join(os.tmpdir(), "simple-chef-rate-limits.json");
    this.windowMs = options?.windowMs ?? RATE_LIMIT_WINDOW_MS;
    this.maxRequests = options?.maxRequests ?? RATE_LIMIT_MAX_REQUESTS;
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const cutoff = Date.now() - this.windowMs;
      if (parsed && typeof parsed === "object") {
        for (const [key, val] of Object.entries(parsed)) {
          if (Array.isArray(val)) {
            const valid = val.filter(
              (n): n is number => typeof n === "number" && Number.isFinite(n) && n > cutoff
            );
            if (valid.length > 0) this.store.set(key, valid);
          }
        }
      }
    } catch {
      // Ignore corrupt cache file and start clean
    }
  }

  private persistToDisk() {
    try {
      const obj: Record<string, number[]> = {};
      for (const [k, v] of this.store.entries()) {
        if (v.length > 0) obj[k] = v;
      }
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(obj), "utf8");
      fs.renameSync(tmp, this.filePath);
    } catch {
      // Non-fatal in read-only environments
    }
  }

  checkAndConsume(
    key: string,
    now = Date.now()
  ): { allowed: true; remaining: number } | { allowed: false; retryAfterSec: number } {
    const cutoff = now - this.windowMs;
    const recent = (this.store.get(key) || []).filter((ts) => ts > cutoff);

    if (recent.length >= this.maxRequests) {
      const oldest = recent[0];
      const retryAfterSec = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return { allowed: false, retryAfterSec };
    }

    recent.push(now);
    this.store.set(key, recent);

    if (this.store.size > 1000) {
      for (const [k, timestamps] of this.store.entries()) {
        const active = timestamps.filter((ts) => ts > cutoff);
        if (active.length === 0) this.store.delete(k);
        else this.store.set(k, active);
      }
    }

    this.persistToDisk();
    return { allowed: true, remaining: Math.max(0, this.maxRequests - recent.length) };
  }
  async checkAndConsumeAsync(
    key: string,
    now = Date.now()
  ): Promise<{ allowed: true; remaining: number } | { allowed: false; retryAfterSec: number }> {
    return this.checkAndConsume(key, now);
  }
}

/**
 * Distributed sliding/fixed-window rate limiter supporting Redis/Upstash REST
 * (RATE_LIMIT_REDIS_REST_URL + RATE_LIMIT_REDIS_REST_TOKEN) for multi-instance Cloud Run,
 * with automatic local file-backed PersistentRateLimiter fallback.
 */
export class DistributedRateLimiter {
  private readonly fallback: PersistentRateLimiter;
  private readonly redisUrl: string | null;
  private readonly redisToken: string | null;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(options?: {
    redisUrl?: string;
    redisToken?: string;
    filePath?: string;
    windowMs?: number;
    maxRequests?: number;
  }) {
    this.windowMs = options?.windowMs ?? RATE_LIMIT_WINDOW_MS;
    this.maxRequests = options?.maxRequests ?? RATE_LIMIT_MAX_REQUESTS;
    this.redisUrl =
      (options?.redisUrl ?? process.env.RATE_LIMIT_REDIS_REST_URL ?? "").trim().replace(/\/+$/, "") ||
      null;
    this.redisToken =
      (options?.redisToken ?? process.env.RATE_LIMIT_REDIS_REST_TOKEN ?? "").trim() || null;
    this.fallback = new PersistentRateLimiter({
      filePath: options?.filePath,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests,
    });
  }

  get isDistributedConfigured(): boolean {
    return Boolean(this.redisUrl && this.redisToken);
  }

  async checkAndConsumeAsync(
    key: string,
    now = Date.now()
  ): Promise<{ allowed: true; remaining: number } | { allowed: false; retryAfterSec: number }> {
    if (!this.redisUrl || !this.redisToken) {
      return this.fallback.checkAndConsume(key, now);
    }

    const bucket = Math.floor(now / this.windowMs);
    const redisKey = `sc:rl:${bucket}:${key}`;
    const windowSec = Math.ceil(this.windowMs / 1000);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.redisToken}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSec, "NX"],
          ["TTL", redisKey],
        ]),
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return this.fallback.checkAndConsume(key, now);
      }

      const data = (await res.json()) as Array<{ result?: unknown }>;
      const count = typeof data?.[0]?.result === "number" ? data[0].result : null;
      const ttl = typeof data?.[2]?.result === "number" && data[2].result > 0 ? data[2].result : windowSec;
      if (count === null) {
        return this.fallback.checkAndConsume(key, now);
      }
      if (count > this.maxRequests) {
        return { allowed: false, retryAfterSec: Math.max(1, ttl) };
      }
      return { allowed: true, remaining: Math.max(0, this.maxRequests - count) };
    } catch {
      return this.fallback.checkAndConsume(key, now);
    }
  }
}

export function normalizeIpAddress(raw: string): string {
  const trimmed = raw.trim().slice(0, 64);
  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice(7);
  }
  return trimmed;
}

export function deriveRateLimitKey(opts: {
  reqIp?: string;
  remoteAddress?: string;
  userIdHeader?: unknown;
}): string {
  // Enforce rate limit strictly on normalized connection IP so clients cannot bypass limits by rotating headers
  const safeIp =
    typeof opts.reqIp === "string" && opts.reqIp.trim()
      ? normalizeIpAddress(opts.reqIp)
      : typeof opts.remoteAddress === "string" && opts.remoteAddress.trim()
      ? normalizeIpAddress(opts.remoteAddress)
      : "unknown";

  return `ip:${safeIp}`;
}
