import React from "react";
import {
  Sparkles,
  Loader2,
  SlidersHorizontal,
  ShoppingCart,
  ChefHat,
  PackageCheck,
  Utensils,
  Zap,
  Flame,
  Refrigerator,
  Clock,
  Heart,
  Wrench
} from "lucide-react";
import {
  CookingEffort,
  CookingEnvironment,
  CookingEquipment,
  DietaryRestriction,
  KitchenProfile,
  MealType
} from "../types";
import {
  ALL_EQUIPMENT_OPTIONS,
  EFFORT_PRESETS,
  ENVIRONMENT_PRESETS
} from "../utils/kitchenProfile";

interface MealGeneratorBarProps {
  profile: KitchenProfile;
  onChangeEnvironment: (env: CookingEnvironment) => void;
  onToggleCustomEquipment: (eq: CookingEquipment) => void;
  onChangeEffort: (effort: CookingEffort) => void;
  onToggleDietary: (tag: DietaryRestriction) => void;
  onPickForMe: () => Promise<void>;
  onGenerateBatch: () => Promise<void>;
  onUseWhatIHave: () => void;
  generatingMode: "single" | "batch" | null;
  activeMethodFilter: string;
  onSelectMethodFilter: (filter: string) => void;
  mealTypeFilter: MealType;
  onChangeMealTypeFilter: (type: MealType) => void;
  maxTimeFilter: number | null;
  onChangeMaxTimeFilter: (mins: number | null) => void;
  pantryCount: number;
  pantryMatchCount: number;
  groceryCount: number;
  favoritesCount: number;
  lessFrequentCount: number;
  onOpenPreferencesModal: () => void;
  onOpenGroceryModal: () => void;
  onOpenRescueModal: () => void;
  onOpenPantryModal: () => void;
}

const ENVIRONMENTS: Array<{
  id: CookingEnvironment;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "full_kitchen", label: "Full Kitchen", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "microwave_only", label: "Microwave Only", icon: <Zap className="w-3.5 h-3.5" /> },
  {
    id: "microwave_mini_fridge",
    label: "Micro + Mini-Fridge",
    icon: <Refrigerator className="w-3.5 h-3.5" />
  },
  { id: "limited_kitchen", label: "Limited Kitchen", icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: "custom", label: "Custom", icon: <Wrench className="w-3.5 h-3.5" /> }
];

const EFFORTS: CookingEffort[] = ["very_low", "low", "moderate", "normal"];

const DIETARY_OPTIONS: Array<{ id: DietaryRestriction; label: string }> = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten_free", label: "Gluten-Free" },
  { id: "dairy_free", label: "Dairy-Free" },
  { id: "high_protein", label: "High Protein" }
];

export const MealGeneratorBar: React.FC<MealGeneratorBarProps> = ({
  profile,
  onChangeEnvironment,
  onToggleCustomEquipment,
  onChangeEffort,
  onToggleDietary,
  onPickForMe,
  onGenerateBatch,
  onUseWhatIHave,
  generatingMode,
  activeMethodFilter,
  onSelectMethodFilter,
  mealTypeFilter,
  onChangeMealTypeFilter,
  maxTimeFilter,
  onChangeMaxTimeFilter,
  pantryCount,
  pantryMatchCount,
  groceryCount,
  favoritesCount,
  lessFrequentCount,
  onOpenPreferencesModal,
  onOpenGroceryModal,
  onOpenRescueModal,
  onOpenPantryModal
}) => {
  const hasStoveOrOven =
    profile.equipment.includes("stove") || profile.equipment.includes("oven");
  const hasToasterOrAirFryer =
    profile.equipment.includes("toaster") || profile.equipment.includes("air_fryer");

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
      {/* Primary Action Hubs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          type="button"
          onClick={onPickForMe}
          disabled={generatingMode !== null}
          className="col-span-2 sm:col-span-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold px-3.5 py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[44px]"
        >
          {generatingMode === "single" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Picking...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Pick For Me</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onUseWhatIHave}
          className={`text-xs font-semibold px-3 py-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors min-h-[44px] ${
            activeMethodFilter === "pantry"
              ? "bg-emerald-900 text-white border-emerald-900"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-200"
          }`}
        >
          <PackageCheck className="w-4 h-4 shrink-0" />
          <span>Use What I Have ({pantryMatchCount})</span>
        </button>

        <button
          type="button"
          onClick={onOpenRescueModal}
          className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-semibold px-3 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
        >
          <ChefHat className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Ingredient Rescue</span>
        </button>

        <button
          type="button"
          onClick={onOpenPantryModal}
          className="bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold px-3 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
        >
          <Refrigerator className="w-4 h-4 text-stone-600 shrink-0" />
          <span>My Pantry ({pantryCount})</span>
        </button>

        <button
          type="button"
          onClick={onOpenGroceryModal}
          className="bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold px-3 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
        >
          <ShoppingCart className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Grocery List ({groceryCount})</span>
        </button>

        <button
          type="button"
          onClick={onOpenPreferencesModal}
          className="bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold px-3 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
        >
          <SlidersHorizontal className="w-4 h-4 text-stone-600 shrink-0" />
          <span>
            Style{lessFrequentCount > 0 ? ` (${lessFrequentCount})` : ""}
          </span>
        </button>
      </div>

      {/* Independent Axis A (Cooking Environment) & Axis B (Cooking Effort) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
        {/* A. Cooking Environment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              1. Your Cooking Equipment
            </span>
            <span className="text-[11px] text-stone-500">
              {profile.environment === "custom"
                ? `${profile.equipment.length} selected`
                : ENVIRONMENT_PRESETS[profile.environment].description}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ENVIRONMENTS.map((env) => {
              const active = profile.environment === env.id;
              return (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => onChangeEnvironment(env.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    active
                      ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {env.icon}
                  <span>{env.label}</span>
                </button>
              );
            })}
          </div>

          {profile.environment === "custom" && (
            <div className="pt-1.5 flex flex-wrap gap-1.5">
              {ALL_EQUIPMENT_OPTIONS.map((eq) => {
                const checked =
                  eq.id === "freezer"
                    ? profile.hasFreezer
                    : profile.equipment.includes(eq.id);
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => onToggleCustomEquipment(eq.id)}
                    aria-pressed={checked}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      checked
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {checked ? `✓ ${eq.label}` : eq.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* B. Independent Effort Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              2. Effort &amp; Recipe Complexity
            </span>
            <span className="text-[11px] text-stone-500">
              {EFFORT_PRESETS[profile.effort].description}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {EFFORTS.map((eff) => {
              const active = profile.effort === eff;
              const label = EFFORT_PRESETS[eff].label
                .replace(" Effort", "")
                .replace(" Cooking", "");
              const range = EFFORT_PRESETS[eff].ingredientRange;
              return (
                <button
                  key={eff}
                  type="button"
                  onClick={() => onChangeEffort(eff)}
                  className={`px-2.5 py-2 rounded-xl text-left border transition-colors ${
                    active
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      active ? "text-emerald-200" : "text-stone-500"
                    }`}
                  >
                    {eff === "normal"
                      ? "Flexible ing."
                      : `${range.min}–${range.max} ingredients`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Browse Filters & +3 Ideas */}
      <div className="pt-3 border-t border-stone-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectMethodFilter("all")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMethodFilter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Matching
          </button>

          {profile.equipment.includes("microwave") && (
            <button
              type="button"
              onClick={() => onSelectMethodFilter("microwave")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeMethodFilter === "microwave"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Microwave
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectMethodFilter("assembly")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMethodFilter === "assembly"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            No-Cook
          </button>

          {(hasStoveOrOven || hasToasterOrAirFryer) && (
            <button
              type="button"
              onClick={() => onSelectMethodFilter("one_skillet")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeMethodFilter === "one_skillet"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {hasStoveOrOven ? "Stove / Oven" : "Toaster / Air Fryer"}
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectMethodFilter("healthy_boost")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMethodFilter === "healthy_boost"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Veggies / Produce
          </button>

          {favoritesCount > 0 && (
            <button
              type="button"
              onClick={() =>
                onSelectMethodFilter(
                  activeMethodFilter === "favorites" ? "all" : "favorites"
                )
              }
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                activeMethodFilter === "favorites"
                  ? "bg-rose-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>Favorites ({favoritesCount})</span>
            </button>
          )}

          <select
            value={mealTypeFilter}
            onChange={(e) => onChangeMealTypeFilter(e.target.value as MealType)}
            aria-label="Filter by meal type"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200 focus:outline-none"
          >
            <option value="any">Any Meal</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>

          <button
            type="button"
            onClick={() =>
              onChangeMaxTimeFilter(
                maxTimeFilter === 10 ? 20 : maxTimeFilter === 20 ? null : 10
              )
            }
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              maxTimeFilter !== null
                ? "bg-emerald-800 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
            title="Cycle max total cooking time"
          >
            <Clock className="w-3 h-3" />
            <span>{maxTimeFilter !== null ? `≤ ${maxTimeFilter}m` : "Any Time"}</span>
          </button>

          {DIETARY_OPTIONS.map((tag) => {
            const active = profile.dietaryRestrictions.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleDietary(tag.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  active
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onGenerateBatch}
          disabled={generatingMode !== null}
          className="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-950 border border-emerald-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          {generatingMode === "batch" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Creating 3 Ideas...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Generate 3 Ideas to Compare</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
