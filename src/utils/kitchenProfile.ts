import {
  CookingEffort,
  CookingEnvironment,
  CookingEquipment,
  DietaryRestriction,
  DormConstraints,
  IngredientStorage,
  KitchenMode,
  KitchenProfile,
  LivingSituation,
  Meal,
  MealIngredient,
  MealType,
  RutMeal,
  SharedKitchenPreference,
} from "../types";

export const STANDARD_DORM_CONSTRAINTS: DormConstraints = {
  limitedFridgeSpace: false,
  limitedFreezerSpace: false,
  limitedFoodStorage: false,
  limitedCounterSpace: false,
  sharedAppliances: false,
  minimalCookware: false,
  preferShelfStable: false,
  smallerQuantities: false,
};

export const DEFAULT_DORM_CONSTRAINTS: DormConstraints = {
  limitedFridgeSpace: true,
  limitedFreezerSpace: true,
  limitedFoodStorage: true,
  limitedCounterSpace: true,
  sharedAppliances: true,
  minimalCookware: true,
  preferShelfStable: true,
  smallerQuantities: true,
};

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
    description: "Microwave and shelf-stable staples — no stove, oven, or fridge",
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
  { id: "other", label: "Other Appliance" },
];

export const DEFAULT_KITCHEN_PROFILE: KitchenProfile = {
  environment: "full_kitchen",
  equipment: [...ENVIRONMENT_PRESETS.full_kitchen.equipment],
  hasFreezer: true,
  effort: "low",
  varietyPreference: "balanced",
  dietaryRestrictions: [],
  livingSituation: "standard",
  dormConstraints: { ...STANDARD_DORM_CONSTRAINTS },
  sharedKitchen: "none",
  otherEquipmentLabel: "",
};

export function normalizeDormConstraints(
  livingSituation: LivingSituation,
  raw?: Partial<DormConstraints>
): DormConstraints {
  const base =
    livingSituation === "dorm" ? DEFAULT_DORM_CONSTRAINTS : STANDARD_DORM_CONSTRAINTS;
  return {
    limitedFridgeSpace: raw?.limitedFridgeSpace ?? base.limitedFridgeSpace,
    limitedFreezerSpace: raw?.limitedFreezerSpace ?? base.limitedFreezerSpace,
    limitedFoodStorage: raw?.limitedFoodStorage ?? base.limitedFoodStorage,
    limitedCounterSpace: raw?.limitedCounterSpace ?? base.limitedCounterSpace,
    sharedAppliances: raw?.sharedAppliances ?? base.sharedAppliances,
    minimalCookware: raw?.minimalCookware ?? base.minimalCookware,
    preferShelfStable: raw?.preferShelfStable ?? base.preferShelfStable,
    smallerQuantities: raw?.smallerQuantities ?? base.smallerQuantities,
  };
}

export function createProfileForEnvironment(
  environment: CookingEnvironment,
  current?: Partial<KitchenProfile>
): KitchenProfile {
  const baseEffort = current?.effort ?? DEFAULT_KITCHEN_PROFILE.effort;
  const varietyPreference =
    current?.varietyPreference ?? DEFAULT_KITCHEN_PROFILE.varietyPreference;
  const dietaryRestrictions = current?.dietaryRestrictions ?? [];
  const livingSituation: LivingSituation =
    current?.livingSituation === "dorm" ? "dorm" : "standard";
  const dormConstraints = normalizeDormConstraints(
    livingSituation,
    current?.dormConstraints
  );
  const sharedKitchen: SharedKitchenPreference =
    current?.sharedKitchen === "available_use" ||
    current?.sharedKitchen === "available_avoid"
      ? current.sharedKitchen
      : "none";
  const otherEquipmentLabel =
    typeof current?.otherEquipmentLabel === "string"
      ? current.otherEquipmentLabel.slice(0, 60)
      : "";

  if (environment === "custom") {
    const equipment =
      current?.equipment && current.equipment.length > 0
        ? [...current.equipment]
        : (["microwave", "fridge"] as CookingEquipment[]);
    const hasFreezer = current?.hasFreezer ?? equipment.includes("freezer");
    const syncedEquipment =
      hasFreezer && !equipment.includes("freezer")
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
      livingSituation,
      dormConstraints,
      sharedKitchen,
      otherEquipmentLabel,
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
    livingSituation,
    dormConstraints,
    sharedKitchen,
    otherEquipmentLabel,
  };
}

export function getEffectiveEquipment(profile: KitchenProfile): Set<CookingEquipment> {
  const owned = new Set<CookingEquipment>(profile.equipment);
  if (profile.hasFreezer) {
    owned.add("freezer");
  }
  if (profile.sharedKitchen === "available_use") {
    owned.add("stove");
    owned.add("oven");
  }
  return owned;
}

export function deriveLegacyKitchenMode(profile: KitchenProfile): KitchenMode {
  const owned = getEffectiveEquipment(profile);
  const hasStoveOrOven = owned.has("stove") || owned.has("oven");
  return hasStoveOrOven ? "full_kitchen" : "microwave_only";
}

const FROZEN_TEXT_REGEX = /\bfrozen\b|\bfreezer\b/i;
const STOVE_REGEX = /\b(skillet|frying pan|saucepan|stovetop|stove top|burner|medium heat|medium-high heat|simmer on (?:the )?stove|simmer in a (?:pot|pan|skillet|saucepan)|boil in a pot|medium pot|large pot|colander|dutch oven|spatula.*pan|pan.*sear)\b/i;
const OVEN_REGEX = /\b(preheat.*oven|baking sheet|sheet pan|sheet-pan|broiler|bake at \d{3}|in the oven)\b/i;
const TOASTER_REGEX = /\b(pop .* in the toaster|toaster oven|in a toaster)\b/i;
const AIR_FRYER_REGEX = /\b(air fryer|air-fry)\b/i;
const MICROWAVE_REGEX = /\b(microwave|micro-wave)\b/i;
const DORM_HEAVY_COOKWARE_REGEX = /\b(colander|strainer|dutch oven|baking sheet|sheet pan|chef's knife|food processor|blender)\b/i;

const FRIDGE_DAIRY_MEAT_REGEX = /\b(rotisserie chicken|grilled chicken strips|deli turkey|deli ham|eggs|egg\b|shredded cheddar|shredded mozzarella|mexican blend|monterey jack|colby jack|feta|ricotta|cottage cheese|greek yogurt|yogurt|butter|milk|tortellini|coleslaw|baby spinach|shredded lettuce|ground beef|ground turkey|ground pork|kielbasa|smoked sausage|italian sausage|sour cream|cream cheese|salmon|raw chicken|chicken breast|chicken thighs|steak|sliced pepperoni|pepperoni|guacamole|pico de gallo|asparagus|fresh green beans|fresh broccoli|baby carrots|cherry tomatoes)\b/i;

const SHELF_STABLE_EXEMPT_REGEX = /\b(canned|can of|pull-tab|pouch|tear-open|dried|shelf[- ]stable|packets?|pack\b|dry\b|ramen|macaroni|penne|rotini|spaghetti|oats|granola|peanut butter|almond butter|tortilla chips|fritos|jarred queso|jarred salsa|salsa\b|marinara|pasta sauce|pizza sauce|teriyaki|soy sauce|bbq sauce|buffalo|hot sauce|sriracha|olive oil|cooking oil|sesame oil|honey|vinegar|banana|russet|baking potato|sweet potato|onion|garlic powder|cornstarch|brown sugar|italian seasoning|chili powder|cumin|paprika|salt|pepper)\b/i;

export function inferIngredientStorage(ing: MealIngredient): IngredientStorage {
  if (ing.storage) return ing.storage;

  const combined = `${ing.item} ${ing.amount}`.toLowerCase();
  if (ing.walmartAisle === "Frozen" || FROZEN_TEXT_REGEX.test(ing.item)) {
    return "freezer";
  }

  // Nut butters are shelf-stable even though they contain "butter"
  if (/\b(peanut|almond|sunflower|cashew)\s+butter\b/i.test(combined)) {
    return "shelf_stable";
  }

  // Explicitly shelf-stable cans/pouches/dry items (only if the primary ingredient isn't fresh/deli/refrigerated)
  if (
    !/\b(pre-cooked grilled|rotisserie|deli|refrigerated|fresh|raw|sliced pepperoni)\b/i.test(
      combined
    ) &&
    /\b(canned|cans?|pull-tab|tear-open|pouch|shelf[- ]stable|pack\b|packets?|dry\b)\b/i.test(
      combined
    )
  ) {
    return "shelf_stable";
  }

  // Pre-cooked bacon / jarred mayo/ranch/pesto: treat real deli pre-cooked bacon & dairy items as fridge
  if (ing.walmartAisle === "Dairy & Eggs") {
    if (/\b(jarred queso|velveeta|powder)\b/i.test(combined)) {
      return "shelf_stable";
    }
    return "fridge";
  }

  if (ing.walmartAisle === "Meat & Deli") {
    if (/\b(bacon bits)\b/i.test(combined) && !/\bpre-cooked bacon slices\b/i.test(combined)) {
      return "shelf_stable";
    }
    return "fridge";
  }

  if (
    FRIDGE_DAIRY_MEAT_REGEX.test(combined) &&
    !/\b(pouch|canned|cans?|dried)\b/i.test(combined)
  ) {
    return "fridge";
  }

  if (ing.walmartAisle === "Pantry / Canned" || ing.walmartAisle === "Spices & Condiments") {
    if (/\b(ranch|mayo|mayonnaise|alfredo|pesto)\b/i.test(combined)) {
      // Unopened jars are shelf-stable, opened require fridge; treat as shelf-stable unless clearly chilled
      return "shelf_stable";
    }
    return "shelf_stable";
  }

  if (ing.walmartAisle === "Bakery") {
    return "shelf_stable";
  }

  if (ing.walmartAisle === "Produce") {
    if (
      SHELF_STABLE_EXEMPT_REGEX.test(combined) &&
      !/\b(bagged|lettuce|spinach|coleslaw|salad|berries|broccoli|asparagus|carrots|tomatoes|guacamole|pico|fresh)\b/i.test(
        combined
      )
    ) {
      return "shelf_stable";
    }
    if (/\b(tomato\b|tomatoes\b|apple|avocado|lemon|lime|banana|potato|onion)\b/i.test(combined) && !/\b(cherry|grape|sliced|bagged|pre-cut)\b/i.test(combined)) {
      return "shelf_stable";
    }
    return "fridge";
  }

  return "shelf_stable";
}

export function getMealStorageProfile(meal: Meal): {
  overall: IngredientStorage;
  requiresFridge: boolean;
  requiresFreezer: boolean;
  isShelfStable: boolean;
} {
  let requiresFreezer = meal.requiresFreezer === true;
  let requiresFridge = false;

  for (const ing of meal.ingredients) {
    const storage = inferIngredientStorage(ing);
    if (storage === "freezer") {
      requiresFreezer = true;
    } else if (storage === "fridge" && !ing.optional) {
      requiresFridge = true;
    }
  }

  const overall: IngredientStorage = requiresFreezer
    ? "freezer"
    : requiresFridge
    ? "fridge"
    : "shelf_stable";

  return {
    overall,
    requiresFridge,
    requiresFreezer,
    isShelfStable: !requiresFridge && !requiresFreezer,
  };
}

export function inferMealRequirements(meal: Meal): {
  requiredEquipment: CookingEquipment[];
  requiresFreezer: boolean;
  requiresFridge: boolean;
  effortLevel: CookingEffort;
  usesHeavyCookware: boolean;
} {
  const stepText = meal.instructions.map((s) => `${s.title} ${s.instruction}`).join(" ");
  const eq = new Set<CookingEquipment>(meal.requiredEquipment || []);

  if (!meal.requiredEquipment) {
    if (meal.category === "microwave" || MICROWAVE_REGEX.test(stepText)) {
      eq.add("microwave");
    }
    if (meal.category === "one_skillet") {
      eq.add("stove");
    }
    if (meal.category === "sheet_pan" && !TOASTER_REGEX.test(stepText) && !AIR_FRYER_REGEX.test(stepText)) {
      eq.add("oven");
    }
  }

  // Always inspect step instructions so explicit requiredEquipment metadata cannot mask stove/oven/appliance steps
  if (STOVE_REGEX.test(stepText)) {
    eq.add("stove");
  }
  if (OVEN_REGEX.test(stepText) && !TOASTER_REGEX.test(stepText) && !AIR_FRYER_REGEX.test(stepText)) {
    eq.add("oven");
  }
  if (!meal.requiredEquipment || !eq.has("oven")) {
    if (TOASTER_REGEX.test(stepText)) {
      eq.add("toaster");
    }
    if (AIR_FRYER_REGEX.test(stepText)) {
      eq.add("air_fryer");
    }
  }

  const storageProfile = getMealStorageProfile(meal);
  const requiresFreezer = storageProfile.requiresFreezer;
  if (requiresFreezer) {
    eq.add("freezer");
  }

  const requiresFridge = eq.has("fridge") || storageProfile.requiresFridge;
  if (requiresFridge && !eq.has("fridge") && meal.requiredEquipment) {
    // Keep inferred requiresFridge true even if explicit requiredEquipment omitted "fridge"
  }

  const totalMinutes = meal.prepMinutes + meal.cookMinutes;
  const ingCount = meal.ingredients.length;
  let effortLevel: CookingEffort = meal.effortLevel ?? "low";
  if (!meal.effortLevel) {
    if (
      ingCount <= 4 &&
      totalMinutes <= 7 &&
      (meal.category === "assembly" || meal.category === "microwave")
    ) {
      effortLevel = "very_low";
    } else if (ingCount <= 6 && totalMinutes <= 16) {
      effortLevel = "low";
    } else if (ingCount <= 9 && totalMinutes <= 28) {
      effortLevel = "moderate";
    } else {
      effortLevel = "normal";
    }
  }

  const usesHeavyCookware =
    eq.has("stove") ||
    eq.has("oven") ||
    DORM_HEAVY_COOKWARE_REGEX.test(stepText);

  return {
    requiredEquipment: Array.from(eq),
    requiresFreezer,
    requiresFridge,
    effortLevel,
    usesHeavyCookware,
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
        /\b(flour tortilla|bread|bagel|english muffin|sub roll|hoagie|bun|buns|naan|flatbread|pasta|penne|rotini|spaghetti|macaroni|tortellini|ramen|noodle|waffle|breaded|panko|crackers|breadcrumbs|biscuit)\b/.test(
          fullText
        )
      ) {
        return false;
      }
    } else if (r === "dairy_free") {
      // Exclude nut butters when checking for dairy "butter"
      const dairySanitized = fullText.replace(
        /\b(peanut|almond|sunflower|cashew|cocoa)\s+butter\b/g,
        ""
      );
      if (
        /\b(cheese|cheddar|mozzarella|parmesan|queso|feta|ricotta|yogurt|butter|alfredo|sour cream|cream cheese|heavy cream|milk|ranch)\b/.test(
          dairySanitized
        )
      ) {
        return false;
      }
    } else if (r === "high_protein") {
      if (
        !/\b(chicken|turkey|beef|pork|egg|eggs|tuna|salmon|shrimp|sausage|meatball|beans|chickpeas|lentils|greek yogurt|cottage cheese|chili|peanut butter)\b/.test(
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
  const owned = getEffectiveEquipment(profile);
  const missing: CookingEquipment[] = [];

  if (reqs.requiresFreezer && !owned.has("freezer")) {
    missing.push("freezer");
  }

  const ovenBlockedByDorm =
    profile.livingSituation === "dorm" &&
    (profile.dormConstraints?.minimalCookware ?? true) &&
    profile.sharedKitchen !== "available_use";

  for (const eq of reqs.requiredEquipment) {
    if (eq === "freezer") continue;
    if ((eq === "toaster" || eq === "air_fryer") && owned.has("oven") && !ovenBlockedByDorm) {
      continue;
    }
    if (eq === "oven" && (owned.has("toaster") || owned.has("air_fryer"))) {
      const stepText = meal.instructions.map((s) => s.instruction).join(" ");
      if (/toaster oven|air[- ]fry/i.test(stepText)) continue;
    }
    if (!owned.has(eq)) {
      missing.push(eq);
    }
  }

  // Universally enforce no-fridge constraint whenever the user does not own a fridge
  if (reqs.requiresFridge && !owned.has("fridge")) {
    missing.push("fridge");
  }

  return {
    compatible: missing.length === 0,
    missingEquipment: Array.from(new Set(missing)),
  };
}

export function isMealDormCompatible(meal: Meal, profile: KitchenProfile): {
  compatible: boolean;
  reason?: string;
} {
  if (profile.livingSituation !== "dorm") {
    return { compatible: true };
  }
  const constraints = profile.dormConstraints ?? DEFAULT_DORM_CONSTRAINTS;
  const reqs = inferMealRequirements(meal);

  if (
    constraints.minimalCookware &&
    profile.sharedKitchen !== "available_use" &&
    reqs.usesHeavyCookware
  ) {
    return {
      compatible: false,
      reason: "Needs full-kitchen pots, pans, or oven (dorm minimal cookware active)",
    };
  }

  if (
    constraints.limitedFreezerSpace &&
    profile.sharedKitchen !== "available_use" &&
    reqs.requiresFreezer
  ) {
    return {
      compatible: false,
      reason: "Needs freezer storage (dorm no/tiny freezer active)",
    };
  }

  return { compatible: true };
}

export function isMealMatchedToLessFrequent(
  meal: Meal,
  lessFrequentList: RutMeal[]
): boolean {
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
    reasons.push(
      `Needs unavailable equipment (${eqCheck.missingEquipment
        .map((e) => e.replace(/_/g, " "))
        .join(", ")})`
    );
  }

  const dormCheck = isMealDormCompatible(meal, profile);
  if (!dormCheck.compatible && dormCheck.reason) {
    reasons.push(dormCheck.reason);
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
  if (/\b(banana crunch|yogurt power bowl|fruit|snack|dip|trail mix)\b/.test(text)) {
    return "snack";
  }
  return "dinner";
}
