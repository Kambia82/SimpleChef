import React, { useState } from "react";
import { Meal } from "../types";
import {
  Clock,
  ChefHat,
  ShoppingBag,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

interface MealCardProps {
  meal: Meal;
  onCook: (meal: Meal) => void;
  onAddToGrocery: (meal: Meal) => void;
  onToggleFavorite?: (mealId: string) => void;
  isFavorite?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onCook,
  onAddToGrocery,
  onToggleFavorite,
  isFavorite = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const totalMinutes = meal.prepMinutes + meal.cookMinutes;

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
            {meal.ingredients.map((ing, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-stone-700 flex items-start justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">{ing.amount}</strong> {ing.item}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 whitespace-nowrap hidden sm:inline">
                  {ing.walmartAisle}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step Preview toggle */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 pt-1 transition-colors"
          >
            <span>{showDetails ? "Hide steps preview" : `Preview all ${meal.instructions.length} steps`}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2.5 pt-2 border-t border-stone-100">
              {meal.instructions.map((step) => (
                <div key={step.stepNumber} className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-150">
                  <span className="font-bold text-stone-800 mr-1.5">Step {step.stepNumber}:</span>
                  {step.instruction}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
        <button
          onClick={() => onCook(meal)}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <ChefHat className="w-4 h-4" />
          <span>Cook Step-by-Step</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onAddToGrocery(meal)}
          className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-sm font-medium py-2.5 px-3 rounded-xl flex items-center justify-center transition-colors"
          title="Add all ingredients to Walmart list"
          aria-label="Add to Walmart List"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
