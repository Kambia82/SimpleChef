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
  PackageCheck,
  Snowflake
} from "lucide-react";
import { KitchenMode } from "../types";

interface MealGeneratorBarProps {
  kitchenMode: KitchenMode;
  onChangeKitchenMode: (mode: KitchenMode) => void;
  noFreezer: boolean;
  onToggleNoFreezer: () => void;
  onGenerateMeal: (energy: string) => Promise<void>;
  onGenerateBatch: (energy: string) => Promise<void>;
  generatingMode: "single" | "batch" | null;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  rutCount: number;
  groceryCount: number;
  pantryCount: number;
  pantryMatchCount: number;
  onOpenRutModal: () => void;
  onOpenGroceryModal: () => void;
  onOpenRescueModal: () => void;
  onOpenPantryModal: () => void;
}

export const MealGeneratorBar: React.FC<MealGeneratorBarProps> = ({
  kitchenMode,
  onChangeKitchenMode,
  noFreezer,
  onToggleNoFreezer,
  onGenerateMeal,
  onGenerateBatch,
  generatingMode,
  activeFilter,
  onSelectFilter,
  rutCount,
  groceryCount,
  pantryCount,
  pantryMatchCount,
  onOpenRutModal,
  onOpenGroceryModal,
  onOpenRescueModal,
  onOpenPantryModal
}) => {
  const isDormMode = kitchenMode === "microwave_only";

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
            {isDormMode
              ? "Dorm-friendly meals using only a microwave or zero heat — no stove, kettle, or hot plate."
              : "Tell me what to eat that takes under 15 minutes and isn't on my Walmart rut list."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Update My Pantry */}
          <button
            onClick={onOpenPantryModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Update what you have on hand to unlock more meal suggestions"
          >
            <PackageCheck className="w-4 h-4 text-emerald-200" />
            <span>My Pantry</span>
            <span className="bg-emerald-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pantryCount}
            </span>
          </button>

          {/* Rescue my random ingredients */}
          <button
            onClick={onOpenRescueModal}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            title="See 3 quick meal options from ingredients you have"
          >
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>Quick Ingredient Rescue</span>
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

      {/* Kitchen Setup Strip */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">Kitchen Setup:</span>
          <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => onChangeKitchenMode("microwave_only")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDormMode
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Microwave Only (Dorm)</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeKitchenMode("full_kitchen")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                !isDormMode
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Full Kitchen</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleNoFreezer}
          aria-pressed={noFreezer}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
            noFreezer
              ? "bg-sky-800 text-white border-sky-800"
              : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
          }`}
          title="Hide meals that require frozen foods when you only have a mini-fridge or pantry"
        >
          <Snowflake className={`w-3.5 h-3.5 ${noFreezer ? "text-sky-200" : "text-sky-600"}`} />
          <span>{noFreezer ? "No Freezer (Active)" : "No Freezer / Mini-Fridge Only"}</span>
        </button>
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
            {isDormMode ? "All Dorm Meals" : "All Easy Meals"}
          </button>

          <button
            onClick={() => onSelectFilter("pantry")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              activeFilter === "pantry"
                ? "bg-emerald-800 text-white"
                : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <PackageCheck className="w-3 h-3" />
            <span>Matches My Pantry ({pantryMatchCount})</span>
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
            <span>{isDormMode ? "Microwave" : "Microwave / No-Cook"}</span>
          </button>

          {isDormMode ? (
            <button
              onClick={() => onSelectFilter("assembly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === "assembly"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              No-Cook Only
            </button>
          ) : (
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
          )}

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

        {/* Big AI Surprise Generator Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onGenerateMeal(activeFilter)}
            disabled={generatingMode !== null}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            {generatingMode === "single" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Generate 1 Idea</span>
              </>
            )}
          </button>

          <button
            onClick={() => onGenerateBatch(activeFilter)}
            disabled={generatingMode !== null}
            className="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            title={
              isDormMode
                ? "Create 3 brand-new microwave or no-cook dorm meal ideas"
                : "Create 3 brand-new meal ideas across freezer, pantry, and fridge styles"
            }
          >
            {generatingMode === "batch" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Creating 3 Ideas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>+ 3 Fresh Ideas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
