import React from "react";
import {
  Sparkles,
  Zap,
  Flame,
  Salad,
  Loader2,
  ShieldAlert,
  ShoppingCart,
  ChefHat,
  RotateCw
} from "lucide-react";

interface MealGeneratorBarProps {
  onGenerateMeal: (energy: string) => Promise<void>;
  isGenerating: boolean;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  rutCount: number;
  groceryCount: number;
  onOpenRutModal: () => void;
  onOpenGroceryModal: () => void;
  onOpenRescueModal: () => void;
}

export const MealGeneratorBar: React.FC<MealGeneratorBarProps> = ({
  onGenerateMeal,
  isGenerating,
  activeFilter,
  onSelectFilter,
  rutCount,
  groceryCount,
  onOpenRutModal,
  onOpenGroceryModal,
  onOpenRescueModal
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Top row: Brain-Free AI Generator Call-to-Action & Quick Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Pick For Me (Zero Brainwork)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            Tell me what to eat that takes under 10 minutes and isn't on my Walmart rut list.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rescue my random ingredients */}
          <button
            onClick={onOpenRescueModal}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Bought groceries with no plan? Turn them into a meal"
          >
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>Rescue My Ingredients</span>
          </button>

          {/* Rut Tracker */}
          <button
            onClick={onOpenRutModal}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border border-stone-200"
            title="Manage meals you keep repeating"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Avoiding {rutCount} Rut Items</span>
          </button>

          {/* Grocery List */}
          <button
            onClick={onOpenGroceryModal}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-200 relative"
            title="View Walmart shopping checklist"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>Walmart List</span>
            {groceryCount > 0 && (
              <span className="bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {groceryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Generator Action Buttons */}
      <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Easy Meals
          </button>

          <button
            onClick={() => onSelectFilter("microwave")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              activeFilter === "microwave"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Microwave / No-Cook</span>
          </button>

          <button
            onClick={() => onSelectFilter("one_skillet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              activeFilter === "one_skillet"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Flame className="w-3 h-3 text-rose-500" />
            <span>1 Skillet / Sheet Pan</span>
          </button>

          <button
            onClick={() => onSelectFilter("healthy_boost")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              activeFilter === "healthy_boost"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Salad className="w-3 h-3 text-emerald-600" />
            <span>Veggie Boost</span>
          </button>
        </div>

        {/* Big AI Surprise Generator Button */}
        <button
          onClick={() => onGenerateMeal(activeFilter)}
          disabled={isGenerating}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking for you...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Generate Fresh Idea (No Thinking)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
