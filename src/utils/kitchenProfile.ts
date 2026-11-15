import {
  CookingEffort,
  CookingEnvironment,
  CookingEquipment,
  DietaryRestriction,
  KitchenMode,
  KitchenProfile,
  Meal,
  MealType,
  RutMeal,
} from "../types";

export const ENVIRONMENT_PRESETS: Record<
  Exclude<CookingEnvironment, "custom">,
  {
    label: string;
    shortLabel: string;
    description: string;
    equipment: CookingEquipment[];
    hasFreezer: boolean;
  }
> = {
  full_kitchen: {
    label: "Full Kitchen",
    shortLabel: "Full Kitchen",
    description: "Stove, oven, microwave, fridge & freezer",
    equipment: ["stove", "oven", "microwave", "fridge", "freezer"],
    hasFreezer: true,
  },
  microwave_only: {
    label: "Microwave Only",
    shortLabel: "Microwave Only",
    description: "Microwave and shelf-stable staples — no stove, oven, or freezer",
    equipment: ["microwave"],
    hasFreezer: false,
  },
  microwave_mini_fridge: {
    label: "Microwave & Mini-Fridge",
    shortLabel: "Micro + Mini-Fridge",
    description: "Microwave and mini-fridge (no freezer or stovetop)",
    equipment: ["microwave", "fridge"],
    hasFreezer: false,
  },
  limited_kitchen: {
    label: "Limited Kitchen",
    shortLabel: "Limited Kitchen",
    description: "Microwave, toaster or air fryer, and fridge — no full stove or oven",
    equipment: ["microwave", "toaster", "air_fryer", "fridge"],
    hasFreezer: false,
  },
};

export const EFFORT_PRESETS: Record<
  CookingEffort,
  {
    label: string;
    description: string;
    ingredientRange: { min: number; max: number };
    maxSteps: number;
  }
> = {
  very_low: {
    label: "Very Low Effort",
    description: "2–5 ingredients · Minimal prep, near-zero cleanup",
    ingredientRange: { min: 2, max: 5 },
    maxSteps: 4,
  },
  low: {
    label: "Low Effort",
    description: "3–7 ingredients · Simple assembly or quick cook",
    ingredientRange: { min: 3, max: 7 },
    maxSteps: 4,
  },
  moderate: {
    label: "Moderate Effort",
    description: "4–9 ingredients · Light chopping, mixing, or multi-step cooking",
    ingredientRange: { min: 4, max: 9 },
    maxSteps: 6,
  },
  normal: {
    label: "Normal Cooking",
    description: "Flexible ingredients · Traditional home-cooked recipes",
    ingredientRange: { min: 5, max: 14 },
    maxSteps: 8,
  },
};

export const ALL_EQUIPMENT_OPTIONS: Array<{ id: CookingEquipment; label: string }> = [
  { id: "microwave", label: "Microwave" },
  { id: "fridge", label: "Refrigerator / Mini-Fridge" },
  { id: "freezer", label: "Freezer" },
  { id: "stove", label: "Stovetop / Burner" },
  { id: "oven", label: "Oven" },
  { id: "toaster", label: "Toaster / Toaster Oven" },
  { id: "air_fryer", label: "Air Fryer" },
];

export const DEFAULT_KITCHEN_PROFILE: KitchenProfile = {
  environment: "full_kitchen",
  equipment: [...ENVIRONMENT_PRESETS.full_kitchen.equipment],
  hasFreezer: true,
  effort: "low",
  varietyPreference: "balanced",
  dietaryRestrictions: [],
};

export function createProfileForEnvironment(
  environment: CookingEnvironment,
  current?: Partial<KitchenProfile>
): KitchenProfile {
  const baseEffort = current?.effort ?? DEFAULT_KITCHEN_PROFILE.effort;
  const varietyPreference = current?.varietyPreference ?? DEFAULT_KITCHEN_PROFILE.varietyPreference;
  const dietaryRestrictions = current?.dietaryRestrictions ?? [];

  if (environment === "custom") {
    const equipment = current?.equipment && current.equipment.length > 0
      ? [...current.equipment]
      : (["microwave", "fridge"] as CookingEquipment[]);
    const hasFreezer = current?.hasFreezer ?? equipment.includes("freezer");
    const syncedEquipment = hasFreezer && !equipment.includes("freezer")
      ? [...equipment, "freezer" as CookingEquipment]
      : !hasFreezer
      ? equipment.filter((e) => e !== "freezer")
      : equipment;
    return {
      environment: "custom",
      equipment: syncedEquipment,
      hasFreezer,
      effort: baseEffort,
      varietyPreference,
      dietaryRestrictions,
    };
  }

  const preset = ENVIRONMENT_PRESETS[environment];
  return {
    environment,
    equipment: [...preset.equipment],
    hasFreezer: preset.hasFreezer,
    effort: baseEffort,
    varietyPreference,
    dietaryRestrictions,
  };
}

export function deriveLegacyKitchenMode(profile: KitchenProfile): KitchenMode {
  const hasStoveOrOven =
    profile.equipment.includes("stove") || profile.equipment.includes("oven");
  return hasStoveOrOven ? "full_kitchen" : "microwave_only";
}

const FROZEN_TEXT_REGEX = /\bfrozen\b|\bfreezer\b/i;
const STOVE_REGEX = /\b(skillet|frying pan|stovetop|stove top|burner|medium heat|medium-high heat|simmer|boil in a pot|medium pot|large pot|colander|spatula.*pan|pan.*sear)\b/i;
const OVEN_REGEX = /\b(preheat.*oven|baking sheet|sheet pan|sheet-pan|broiler|bake at \d{3})\b/i;
const TOASTER_REGEX = /\b(pop .* in the toaster|toaster oven|in a toaster)\b/i;
const AIR_FRYER_REGEX = /\b(air fryer|air-fry)\b/i;
const MICROWAVE_REGEX = /\b(microwave|micro-wave)\b/i;
const FRIDGE_DAIRY_MEAT_REGEX = /\b(rotisserie chicken|grilled chicken strips|deli turkey|deli ham|eggs|shredded cheddar|shredded mozzarella|mexican blend|greek yogurt|butter|milk|tortellini|coleslaw|baby spinach|shredded lettuce|ground beef|ground turkey|kielbasa|smoked sausage|sour cream|cream cheese|salmon|raw chicken)\b/i;

export function inferMealRequirements(meal: Meal): {
  requiredEquipment: CookingEquipment[];
  requiresFreezer: boolean;
  requiresFridge: boolean;
  effortLevel: CookingEffort;
} {
  const stepText = meal.instructions.map((s) => `${s.title} ${s.instruction}`).join(" ");
  const fullText = `${meal.title} ${meal.tagline} ${stepText}`;
  const ingText = meal.ingredients.map((i) => i.item).join(" ");

  const eq = new Set<CookingEquipment>(meal.requiredEquipment || []);

  if (!meal.requiredEquipment) {
    if (meal.category === "microwave" || MICROWAVE_REGEX.test(stepText)) {
      eq.add("microwave");
    }
    if (meal.category === "one_skillet" || STOVE_REGEX.test(stepText)) {
      eq.add("stove");
    }
    if (meal.category === "sheet_pan" || OVEN_REGEX.test(stepText)) {
      // Some toaster-oven / air-fryer friendly flatbreads can work with oven OR toaster/air fryer;
      // detect explicit oven requirement unless toaster/air-fryer mentioned
      if (!TOASTER_REGEX.test(stepText) && !AIR_FRYER_REGEX.test(stepText)) {
        eq.add("oven");
      }
    }
    if (TOASTER_REGEX.test(stepText)) {
      eq.add("toaster");
    }
    if (AIR_FRYER_REGEX.test(stepText)) {
      eq.add("air_fryer");
    }
  }

  const requiresFreezer =
    meal.requiresFreezer === true ||
    meal.ingredients.some(
      (ing) => ing.walmartAisle === "Frozen" || FROZEN_TEXT_REGEX.test(ing.item)
    );

  if (requiresFreezer) {
    eq.add("freezer");
  }

  const isShelfStableIngredient = (item: string, amount: string, aisle: string) =>
    aisle === "Pantry / Canned" ||
    /\b(canned|can|pouch|jar|jarred|dried|shelf[- ]stable|packets?)\b/i.test(`${item} ${amount}`);

  const requiresFridge =
    eq.has("fridge") ||
    meal.ingredients.some((ing) => {
      if (isShelfStableIngredient(ing.item, ing.amount, ing.walmartAisle)) {
        return false;
      }
      return (
        ing.walmartAisle === "Dairy & Eggs" ||
        FRIDGE_DAIRY_MEAT_REGEX.test(ing.item)
      );
    });

  const totalMinutes = meal.prepMinutes + meal.cookMinutes;
  const ingCount = meal.ingredients.length;
  let effortLevel: CookingEffort = meal.effortLevel ?? "low";
  if (!meal.effortLevel) {
    if (ingCount <= 4 && totalMinutes <= 7 && (meal.category === "assembly" || meal.category === "microwave")) {
      effortLevel = "very_low";
    } else if (ingCount <= 6 && totalMinutes <= 16) {
      effortLevel = "low";
    } else if (ingCount <= 9 && totalMinutes <= 28) {
      effortLevel = "moderate";
    } else {
      effortLevel = "normal";
    }
  }

  return {
    requiredEquipment: Array.from(eq),
    requiresFreezer,
    requiresFridge,
    effortLevel,
  };
}

export function mealMatchesDietaryRestrictions(
  meal: Meal,
  restrictions: DietaryRestriction[]
): boolean {
  if (!restrictions || restrictions.length === 0) return true;
  const fullText = `${meal.title} ${meal.tagline} ${meal.ingredients
    .map((i) => i.item)
    .join(" ")}`.toLowerCase();

  for (const r of restrictions) {
    if (meal.dietaryTags && meal.dietaryTags.includes(r)) continue;

    if (r === "vegetarian") {
      if (
        /\b(chicken|turkey|beef|pork|bacon|sausage|kielbasa|pepperoni|ham|tuna|shrimp|salmon|fish|meatball|chili with beans|beef chili)\b/.test(
          fullText
        )
      ) {
        return false;
      }
    } else if (r === "gluten_free") {
      if (
        /\b(flour tortilla|bread|toast|bagel|english muffin|sub roll|hoagie|bun|buns|naan|flatbread|pasta|penne|rotini|spaghetti|macaroni|tortellini|ramen|noodle|waffle|breaded|panko|crackers|breadcrumbs)\b/.test(
          fullText
        )
      ) {
        return false;
      }
    } else if (r === "dairy_free") {
      if (
        /\b(cheese|cheddar|mozzarella|parmesan|queso|feta|yogurt|butter|alfredo|cream|ranch)\b/.test(
          fullText
        )
      ) {
        return false;
      }
    } else if (r === "high_protein") {
      if (
        !/\b(chicken|turkey|beef|pork|egg|eggs|tuna|salmon|shrimp|sausage|meatball|beans|greek yogurt|cottage cheese|chili)\b/.test(
          fullText
        )
      ) {
        return false;
      }
    }
  }

  return true;
}

export function getMealEffortTierMatches(
  mealEffort: CookingEffort,
  targetEffort: CookingEffort,
  mode: "exact" | "up_to" = "exact"
): boolean {
  const rank: Record<CookingEffort, number> = {
    very_low: 0,
    low: 1,
    moderate: 2,
    normal: 3,
  };
  if (mode === "exact") {
    return mealEffort === targetEffort;
  }
  return rank[mealEffort] <= rank[targetEffort];
}

export function isMealEquipmentCompatible(
  meal: Meal,
  profile: KitchenProfile
): { compatible: boolean; missingEquipment: CookingEquipment[] } {
  const reqs = inferMealRequirements(meal);
  const owned = new Set<CookingEquipment>(profile.equipment);
  if (profile.hasFreezer) owned.add("freezer");

  const missing: CookingEquipment[] = [];

  if (reqs.requiresFreezer && !profile.hasFreezer) {
    missing.push("freezer");
  }

  for (const eq of reqs.requiredEquipment) {
    if (eq === "freezer") continue; // handled above
    // Oven & toaster/air_fryer versatility: toaster/air_fryer recipes can also run in oven
    if ((eq === "toaster" || eq === "air_fryer") && owned.has("oven")) {
      continue;
    }
    // Note: if meal requires oven but step explicitly supports toaster oven or air fryer
    if (eq === "oven" && (owned.has("toaster") || owned.has("air_fryer"))) {
      const stepText = meal.instructions.map((s) => s.instruction).join(" ");
      if (/toaster oven|air[- ]fry/i.test(stepText)) continue;
    }
    if (!owned.has(eq)) {
      missing.push(eq);
    }
  }

  // Strictly respect microwave_only (no fridge & no freezer): disallow refrigerated perishables if user explicitly chose microwave_only (no fridge)
  if (reqs.requiresFridge && !owned.has("fridge") && profile.environment === "microwave_only") {
    // Allow shelf-stable / fast same-day meals only if meal is explicitly marked microwave-only safe OR doesn't assume fridge storage?
    // Actually college students without a fridge only keep shelf-stable items OR buy single-day snacks; let's check fridge requirement cleanly!
    missing.push("fridge");
  }

  return {
    compatible: missing.length === 0,
    missingEquipment: Array.from(new Set(missing)),
  };
}

export function isMealMatchedToLessFrequent(meal: Meal, lessFrequentList: RutMeal[]): boolean {
  if (!lessFrequentList || lessFrequentList.length === 0) return false;
  const hay = `${meal.title} ${meal.comfortVariationOf || ""}`.toLowerCase();
  return lessFrequentList.some((r) => {
    const needle = r.name.trim().toLowerCase();
    return needle.length >= 2 && hay.includes(needle);
  });
}

export interface MealEligibilityResult {
  eligible: boolean;
  reasons: string[];
  missingEquipment: CookingEquipment[];
  inferredEffort: CookingEffort;
}

export function getMealEligibility(
  meal: Meal,
  profile: KitchenProfile,
  options?: {
    mealType?: MealType;
    effortMatchMode?: "exact" | "up_to" | "any";
    lessFrequentList?: RutMeal[];
  }
): MealEligibilityResult {
  const reasons: string[] = [];
  const reqs = inferMealRequirements(meal);
  const eqCheck = isMealEquipmentCompatible(meal, profile);

  if (!eqCheck.compatible) {
    reasons.push(`Needs unavailable equipment (${eqCheck.missingEquipment.join(", ")})`);
  }

  const effortMatchMode = options?.effortMatchMode ?? "exact";
  if (
    effortMatchMode !== "any" &&
    !getMealEffortTierMatches(reqs.effortLevel, profile.effort, effortMatchMode)
  ) {
    reasons.push(`Effort level is ${EFFORT_PRESETS[reqs.effortLevel].label}`);
  }

  if (options?.mealType && options.mealType !== "any") {
    const inferredType = meal.mealType ?? inferMealType(meal);
    if (inferredType !== options.mealType) {
      reasons.push(`Meal type is ${inferredType}`);
    }
  }

  if (!mealMatchesDietaryRestrictions(meal, profile.dietaryRestrictions)) {
    reasons.push("Does not match active dietary preferences");
  }

  if (
    profile.varietyPreference === "new_ideas" &&
    options?.lessFrequentList &&
    isMealMatchedToLessFrequent(meal, options.lessFrequentList)
  ) {
    reasons.push("On your 'see less often' list while set to New Ideas");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    missingEquipment: eqCheck.missingEquipment,
    inferredEffort: reqs.effortLevel,
  };
}

export function inferMealType(meal: Meal): Exclude<MealType, "any"> {
  if (meal.mealType) return meal.mealType;
  const text = `${meal.title} ${meal.tagline}`.toLowerCase();
  if (/\b(breakfast|egg|waffle|oatmeal|yogurt|granola|hashbrown|muffin)\b/.test(text)) {
    return "breakfast";
  }
  if (/\b(wrap|sandwich|sub|salad|quesadilla|melt|club|nachos)\b/.test(text)) {
    return "lunch";
  }
  if (/\b(banana crunch|yogurt power bowl|fruit)\b/.test(text)) {
    return "snack";
  }
  return "dinner";
}
