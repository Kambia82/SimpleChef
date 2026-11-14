import React, { useState } from "react";
import { Meal, MealAddon, PantryItem } from "../types";
import {
  Clock,
  ChefHat,
  ShoppingBag,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Utensils,
  Check
} from "lucide-react";

import { getPantryMatchStats } from "../utils/pantryMatch";
import { getMealExtras } from "../utils/mealExtras";

interface MealCardProps {
  meal: Meal;
  onCook: (meal: Meal) => void;
  onAddToGrocery: (meal: Meal) => void;
  onAddMissingToGrocery: (meal: Meal) => void;
  onAddExtraToGrocery?: (addon: MealAddon, mealTitle: string) => void;
  onToggleFavorite?: (mealId: string) => void;
  isFavorite?: boolean;
  pantryItems?: PantryItem[];
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onCook,
  onAddToGrocery,
  onAddMissingToGrocery,
  onAddExtraToGrocery,
  onToggleFavorite,
  isFavorite = false,
  pantryItems = []
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [addedExtras, setAddedExtras] = useState<Record<string, boolean>>({});
  const totalMinutes = meal.prepMinutes + meal.cookMinutes;
  const pantryMatch = pantryItems.length > 0 ? getPantryMatchStats(meal, pantryItems) : null;
  const missingCount = pantryMatch ? pantryMatch.totalCount - pantryMatch.matchCount : meal.ingredients.length;
  const hasPartialMatch = Boolean(pantryMatch && pantryMatch.matchCount > 0 && !pantryMatch.isFullMatch);
  const { addons, sides } = getMealExtras(meal);

  const handleAddExtra = (extra: MealAddon) => {
    if (!onAddExtraToGrocery) return;
    onAddExtraToGrocery(extra, meal.title);
    setAddedExtras((prev) => ({ ...prev, [extra.item]: true }));
  };

  const getCategoryLabel = (category: Meal["category"]) => {
    switch (category) {
      case "microwave":
        return "Microwave Only";
      case "assembly":
        return "No-Cook Assembly";
      case "one_skillet":
        return "1 Skillet";
      case "sheet_pan":
        return "Sheet Pan";
      case "comfort":
        return "Cozy Comfort";
      default:
        return "Easy Meal";
    }
  };

  return (
    <div
      id={`meal-card-${meal.id}`}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Badges & Favorite */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{totalMinutes} mins total</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>{meal.ingredients.length} ingredients</span>
            </span>

            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
              {getCategoryLabel(meal.category)}
            </span>

            {pantryMatch && pantryMatch.matchCount > 0 && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  pantryMatch.isFullMatch
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                {pantryMatch.isFullMatch
                  ? "✓ Ready in pantry"
                  : `✓ Have ${pantryMatch.matchCount}/${pantryMatch.totalCount} in pantry`}
              </span>
            )}
          </div>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(meal.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              }`}
              title={isFavorite ? "Remove from favorites" : "Save to favorites"}
              aria-label="Toggle favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>

        {/* Title and Tagline */}
        <div>
          <h3 className="text-xl font-bold text-stone-900 tracking-tight leading-snug">
            {meal.title}
          </h3>
          <p className="text-sm text-stone-600 mt-1 leading-relaxed">
            {meal.tagline}
          </p>
        </div>

        {/* Rut comparison badge */}
        {meal.rutAlternativeNote && (
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-950">Rut Breaker: </span>
              {meal.rutAlternativeNote}
            </div>
          </div>
        )}

        {/* Ingredients Quick List */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Ingredients ({meal.ingredients.length}):
          </div>
          <ul className="space-y-1.5">
            {meal.ingredients.map((ing, idx) => {
              const hasInPantry = pantryMatch?.matchedIngredients[idx] ?? false;
              return (
                <li
                  key={idx}
                  className="text-xs sm:text-sm text-stone-700 flex items-start justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        hasInPantry ? "bg-emerald-600 ring-2 ring-emerald-200" : "bg-stone-300"
                      }`}
                    />
                    <span>
                      <strong className="text-stone-900 font-semibold">{ing.amount}</strong> {ing.item}
                      {hasInPantry && (
                        <span className="ml-1.5 text-[10px] font-semibold text-emerald-700">
                          (in pantry)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 whitespace-nowrap hidden sm:inline">
                    {ing.walmartAisle}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Step Preview & Optional Add-ons/Sides Toggles */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 pt-1 transition-colors"
            >
              <span>{showDetails ? "Hide steps preview" : `Preview all ${meal.instructions.length} steps`}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowExtras(!showExtras)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 pt-1 transition-colors"
            >
              <Utensils className="w-3 h-3" />
              <span>{showExtras ? "Hide add-ons & sides" : "Optional add-ons & sides"}</span>
              {showExtras ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showDetails && (
            <div className="mt-2 space-y-2.5 pt-2 border-t border-stone-100">
              {meal.instructions.map((step) => (
                <div key={step.stepNumber} className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-150">
                  <span className="font-bold text-stone-800 mr-1.5">Step {step.stepNumber}:</span>
                  {step.instruction}
                </div>
              ))}
            </div>
          )}

          {showExtras && (
            <div className="mt-2 space-y-3 pt-2.5 border-t border-stone-100">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Take It a Step Further (Optional Add-Ins):
                </div>
                <ul className="space-y-1.5">
                  {addons.map((addon, i) => (
                    <li
                      key={i}
                      className="text-xs bg-amber-50/60 border border-amber-200/70 rounded-lg p-2 flex items-start justify-between gap-2"
                    >
                      <div className="text-stone-700">
                        <strong className="text-stone-900">{addon.item}:</strong> {addon.howToUse}
                      </div>
                      {onAddExtraToGrocery && (
                        <button
                          type="button"
                          onClick={() => handleAddExtra(addon)}
                          className={`shrink-0 text-[11px] font-semibold border px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors ${
                            addedExtras[addon.item]
                              ? "bg-emerald-700 text-white border-emerald-700"
                              : "bg-white hover:bg-amber-100 text-amber-900 border-amber-300"
                          }`}
                          title={`Add ${addon.item} to Walmart list (${addon.walmartAisle})`}
                        >
                          {addedExtras[addon.item] ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>List</span>
                            </>
                          )}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Easy Side Pairings (Zero-Fuss):
                </div>
                <ul className="space-y-1.5">
                  {sides.map((side, i) => (
                    <li
                      key={i}
                      className="text-xs bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-2 flex items-start justify-between gap-2"
                    >
                      <div className="text-stone-700">
                        <strong className="text-stone-900">{side.item}:</strong> {side.howToUse}
                      </div>
                      {onAddExtraToGrocery && (
                        <button
                          type="button"
                          onClick={() => handleAddExtra(side)}
                          className={`shrink-0 text-[11px] font-semibold border px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors ${
                            addedExtras[side.item]
                              ? "bg-emerald-700 text-white border-emerald-700"
                              : "bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300"
                          }`}
                          title={`Add ${side.item} to Walmart list (${side.walmartAisle})`}
                        >
                          {addedExtras[side.item] ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>List</span>
                            </>
                          )}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
        <button
          onClick={() => onCook(meal)}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <ChefHat className="w-4 h-4" />
          <span>Cook Step-by-Step</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {hasPartialMatch && (
          <button
            onClick={() => onAddMissingToGrocery(meal)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
            title={`Add only the ${missingCount} missing item${missingCount === 1 ? "" : "s"} to Walmart list`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Missing ({missingCount})</span>
          </button>
        )}

        <button
          onClick={() => onAddToGrocery(meal)}
          className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-sm font-medium py-2.5 px-3 rounded-xl flex items-center justify-center transition-colors shrink-0"
          title="Add all ingredients to Walmart list"
          aria-label="Add all ingredients to Walmart List"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
