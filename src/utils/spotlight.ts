import { KitchenProfile, Meal, MealType, PantryItem, RutMeal } from "../types";
import {
  EFFORT_PRESETS,
  ENVIRONMENT_PRESETS,
  getEffectiveEquipment,
  getMealEligibility,
  getMealStorageProfile,
  isMealMatchedToLessFrequent,
} from "./kitchenProfile";
import { getPantryMatchStats } from "./pantryMatch";

export interface SpotlightSelectionParams {
  meals: Meal[];
  profile: KitchenProfile;
  lessFrequentList: RutMeal[];
  pantryItems: PantryItem[];
  recentSpotlightIds: string[];
  currentSpotlightId?: string | null;
  mealType?: MealType;
  forceNewPick?: boolean;
}

export type SpotlightAdjustmentAction =
  | "relax_effort"
  | "add_fridge"
  | "use_shared_kitchen"
  | "reset_filters"
  | "generate_ai";

export interface SpotlightSelectionResult {
  meal: Meal | null;
  eligiblePoolCount: number;
  updatedRecentIds: string[];
  emptyReason: string | null;
  suggestedAdjustments: Array<{
    id: string;
    label: string;
    action: SpotlightAdjustmentAction;
  }>;
}

function scoreMealForSpotlight(
  meal: Meal,
  profile: KitchenProfile,
  pantryItems: PantryItem[],
  lessFrequentList: RutMeal[]
): number {
  let score = 0;

  // Pantry coverage boost
  if (pantryItems.length > 0) {
    const stats = getPantryMatchStats(meal, pantryItems);
    score += stats.ratio * 40 + stats.matchCount * 6;
    if (stats.isFullMatch) score += 25;
  }

  // Living situation & dorm preference boosts
  if (profile.livingSituation === "dorm") {
    const storage = getMealStorageProfile(meal);
    if (profile.dormConstraints?.preferShelfStable && storage.isShelfStable) {
      score += 12;
    }
    if (profile.dormConstraints?.smallerQuantities && meal.ingredients.length <= 6) {
      score += 6;
    }
  }

  // Variety preference weighting
  const isFamiliarMatch =
    Boolean(meal.comfortVariationOf) ||
    meal.category === "comfort" ||
    isMealMatchedToLessFrequent(meal, lessFrequentList);

  if (profile.varietyPreference === "familiar") {
    if (isFamiliarMatch) score += 18;
  } else if (profile.varietyPreference === "new_ideas") {
    if (meal.id.startsWith("ai-")) score += 12;
    if (!isFamiliarMatch) score += 10;
  } else {
    // balanced: gently deprioritize items user asked to see less often without hiding them
    if (isMealMatchedToLessFrequent(meal, lessFrequentList)) {
      score -= 12;
    }
  }

  return score;
}

export function selectSpotlightMeal(
  params: SpotlightSelectionParams
): SpotlightSelectionResult {
  const {
    meals,
    profile,
    lessFrequentList,
    pantryItems,
    recentSpotlightIds,
    currentSpotlightId = null,
    mealType = "any",
    forceNewPick = false,
  } = params;

  const eligibleMeals = meals.filter(
    (m) =>
      getMealEligibility(m, profile, {
        mealType,
        effortMatchMode: "exact",
        lessFrequentList,
      }).eligible
  );

  if (eligibleMeals.length === 0) {
    const envLabel =
      profile.environment === "custom"
        ? "Custom Equipment"
        : ENVIRONMENT_PRESETS[profile.environment].label;
    const effortLabel = EFFORT_PRESETS[profile.effort].label;
    const owned = getEffectiveEquipment(profile);

    const adjustments: SpotlightSelectionResult["suggestedAdjustments"] = [
      {
        id: "generate-ai",
        label: `Generate ${effortLabel} meal for ${envLabel}`,
        action: "generate_ai",
      },
    ];

    if (profile.effort === "normal" && !owned.has("stove") && !owned.has("oven")) {
      adjustments.push({
        id: "relax-effort",
        label: "Switch to Moderate Effort",
        action: "relax_effort",
      });
    } else if (profile.effort !== "low") {
      adjustments.push({
        id: "relax-effort",
        label: "Switch to Low Effort",
        action: "relax_effort",
      });
    }

    if (!owned.has("fridge") && owned.has("microwave")) {
      adjustments.push({
        id: "add-fridge",
        label: "Add Mini-Fridge Access",
        action: "add_fridge",
      });
    }

    if (profile.sharedKitchen === "available_avoid") {
      adjustments.push({
        id: "use-shared-kitchen",
        label: "Include Shared Kitchen",
        action: "use_shared_kitchen",
      });
    }

    if (
      mealType !== "any" ||
      profile.dietaryRestrictions.length > 0 ||
      profile.varietyPreference === "new_ideas"
    ) {
      adjustments.push({
        id: "reset-filters",
        label: "Reset meal type & dietary filters",
        action: "reset_filters",
      });
    }

    return {
      meal: null,
      eligiblePoolCount: 0,
      updatedRecentIds: recentSpotlightIds,
      emptyReason: `No saved meals match ${envLabel}${
        profile.livingSituation === "dorm" ? " (Dorm setup)" : ""
      } + ${effortLabel}${mealType !== "any" ? ` (${mealType})` : ""}${
        profile.dietaryRestrictions.length > 0
          ? ` with ${profile.dietaryRestrictions.join(", ").replace(/_/g, " ")}`
          : ""
      }.`,
      suggestedAdjustments: adjustments,
    };
  }

  // Keep current spotlight ONLY if we are not explicitly asking for a new pick AND current is still eligible
  if (!forceNewPick && currentSpotlightId) {
    const currentStillEligible = eligibleMeals.find((m) => m.id === currentSpotlightId);
    if (currentStillEligible) {
      return {
        meal: currentStillEligible,
        eligiblePoolCount: eligibleMeals.length,
        updatedRecentIds: recentSpotlightIds,
        emptyReason: null,
        suggestedAdjustments: [],
      };
    }
  }

  // Filter out recently shown meals when picking a fresh Spotlight
  const recentSet = new Set(recentSpotlightIds);
  let candidatePool = eligibleMeals.filter((m) => !recentSet.has(m.id));

  // If requesting next pick and currentSpotlightId happens not to be in recentSet, still exclude it if pool has > 1
  if (forceNewPick && currentSpotlightId && candidatePool.length > 1) {
    candidatePool = candidatePool.filter((m) => m.id !== currentSpotlightId);
  }

  // Once we've exhausted all eligible meals, reset history while still avoiding repeating the exact current meal
  let baseRecent = recentSpotlightIds;
  if (candidatePool.length === 0) {
    baseRecent = currentSpotlightId ? [currentSpotlightId] : [];
    candidatePool =
      eligibleMeals.length > 1 && currentSpotlightId
        ? eligibleMeals.filter((m) => m.id !== currentSpotlightId)
        : eligibleMeals;
  }

  // Rank candidates deterministically by score, keeping library order as tie-breaker
  const ranked = [...candidatePool].sort((a, b) => {
    const scoreDiff =
      scoreMealForSpotlight(b, profile, pantryItems, lessFrequentList) -
      scoreMealForSpotlight(a, profile, pantryItems, lessFrequentList);
    return scoreDiff;
  });

  const chosen = ranked[0] || eligibleMeals[0];
  const updatedRecentIds = [
    chosen.id,
    ...baseRecent.filter((id) => id !== chosen.id),
  ].slice(0, 12);

  return {
    meal: chosen,
    eligiblePoolCount: eligibleMeals.length,
    updatedRecentIds,
    emptyReason: null,
    suggestedAdjustments: [],
  };
}
