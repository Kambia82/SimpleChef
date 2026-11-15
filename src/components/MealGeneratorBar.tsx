import React, { useState } from "react";
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
  Wrench,
  Home,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from "lucide-react";
import {
  CookingEffort,
  CookingEnvironment,
  CookingEquipment,
  DietaryRestriction,
  DormConstraints,
  KitchenProfile,
  LivingSituation,
  MealType,
  SharedKitchenPreference
} from "../types";
import {
  ALL_EQUIPMENT_OPTIONS,
  DEFAULT_DORM_CONSTRAINTS,
  EFFORT_PRESETS,
  ENVIRONMENT_PRESETS,
  getEffectiveEquipment
} from "../utils/kitchenProfile";

interface MealGeneratorBarProps {
  profile: KitchenProfile;
  eligibleCount: number;
  onChangeEnvironment: (env: CookingEnvironment) => void;
  onToggleCustomEquipment: (eq: CookingEquipment) => void;
  onChangeOtherEquipmentLabel: (label: string) => void;
  onChangeEffort: (effort: CookingEffort) => void;
  onChangeLivingSituation: (living: LivingSituation) => void;
  onToggleDormConstraint: (key: keyof DormConstraints) => void;
  onChangeSharedKitchen: (pref: SharedKitchenPreference) => void;
  onToggleDietary: (tag: DietaryRestriction) => void;
  onPickForMe: () => Promise<void>;
  onGenerateBatch: () => Promise<void>;
  onUseWhatIHave: () => void;
  onBrowseMeals: () => void;
  onOpenFavorites: () => void;
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
  spotlightTitle?: string | null;
  resultsRefreshTick?: number;
  onJumpToResults?: () => void;
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

const DORM_CONSTRAINT_LABELS: Array<{
  key: keyof DormConstraints;
  label: string;
}> = [
  { key: "minimalCookware", label: "Mug/bowl/plate only" },
  { key: "preferShelfStable", label: "Favor shelf-stable" },
  { key: "smallerQuantities", label: "Smaller single-serve packs" },
  { key: "limitedFridgeSpace", label: "Small mini-fridge" },
  { key: "limitedFreezerSpace", label: "No/tiny freezer" },
  { key: "limitedFoodStorage", label: "Small dry storage" },
  { key: "limitedCounterSpace", label: "Minimal prep space" },
  { key: "sharedAppliances", label: "Shared hall appliances" }
];

export const MealGeneratorBar: React.FC<MealGeneratorBarProps> = ({
  profile,
  eligibleCount,
  onChangeEnvironment,
  onToggleCustomEquipment,
  onChangeOtherEquipmentLabel,
  onChangeEffort,
  onChangeLivingSituation,
  onToggleDormConstraint,
  onChangeSharedKitchen,
  onToggleDietary,
  onPickForMe,
  onGenerateBatch,
  onUseWhatIHave,
  onBrowseMeals,
  onOpenFavorites,
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
  onOpenPantryModal,
  spotlightTitle,
  resultsRefreshTick = 0,
  onJumpToResults
}) => {
  const [setupExpanded, setSetupExpanded] = useState(true);
  const effectiveEq = getEffectiveEquipment(profile);
  const hasStoveOrOven = effectiveEq.has("stove") || effectiveEq.has("oven");
  const hasToasterOrAirFryer =
    effectiveEq.has("toaster") || effectiveEq.has("air_fryer");
  const dormConstraints = profile.dormConstraints ?? DEFAULT_DORM_CONSTRAINTS;

  const envLabel =
    profile.environment === "custom"
      ? `Custom (${
          profile.equipment
            .map((e) =>
              e === "other" && profile.otherEquipmentLabel
                ? profile.otherEquipmentLabel
                : e.replace(/_/g, " ")
            )
            .join(", ") || "No-cook"
        })`
      : ENVIRONMENT_PRESETS[profile.environment].label;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
      {/* Primary Task Hub (8 clear workflows) */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={onPickForMe}
            disabled={generatingMode !== null}
            className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            {generatingMode === "single" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Picking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>Pick Something for Me</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onUseWhatIHave}
            className={`min-h-[44px] text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
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
            className="min-h-[44px] bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChefHat className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Ingredient Rescue</span>
          </button>

          <button
            type="button"
            onClick={onBrowseMeals}
            className="min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-stone-600 shrink-0" />
            <span>Browse Meals ({eligibleCount})</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={onOpenPantryModal}
            className="min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Refrigerator className="w-4 h-4 text-stone-600 shrink-0" />
            <span>My Pantry ({pantryCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenGroceryModal}
            className="min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>My Grocery List ({groceryCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenFavorites}
            className={`min-h-[44px] text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
              activeMethodFilter === "favorites"
                ? "bg-rose-700 text-white border-rose-700"
                : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200"
            }`}
          >
            <Heart
              className={`w-4 h-4 shrink-0 ${
                activeMethodFilter === "favorites" ? "fill-white text-white" : "text-rose-500"
              }`}
            />
            <span>Favorites ({favoritesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSetupExpanded((prev) => !prev)}
            aria-expanded={setupExpanded}
            className={`min-h-[44px] text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
              setupExpanded
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            <span>Cooking Preferences</span>
            {setupExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Active Setup Status Line (with live count & instant top-pick preview) */}
      <div
        key={`setup-status-${resultsRefreshTick}`}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-stone-700 min-w-0">
          <span className="font-bold text-stone-900">Active Setup:</span>
          <span>{envLabel}</span>
          <span aria-hidden="true">·</span>
          <span>
            {profile.livingSituation === "dorm"
              ? "Dorm / College Living"
              : "Standard Kitchen Setup"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{EFFORT_PRESETS[profile.effort].label}</span>
          {profile.sharedKitchen === "available_use" && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-800 font-semibold">Shared Kitchen Included</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="font-bold text-emerald-800">
            {eligibleCount} matching meal{eligibleCount === 1 ? "" : "s"}
          </span>
          {spotlightTitle && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-stone-600 truncate max-w-[260px]">
                Top Pick: <strong className="text-stone-900">{spotlightTitle}</strong>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onJumpToResults && (
            <button
              type="button"
              onClick={onJumpToResults}
              className="text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2"
            >
              View Meals ↓
            </button>
          )}
          <button
            type="button"
            onClick={onOpenPreferencesModal}
            className="text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2"
          >
            Variety &amp; Comfort{lessFrequentCount > 0 ? ` (${lessFrequentCount})` : ""}
          </button>
        </div>
      </div>

      {/* Decoupled 3-Axis Cooking Preferences Panel */}
      {setupExpanded && (
        <div
          id="cooking-preferences-panel"
          className="space-y-4 pt-3 border-t border-stone-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Axis 1: Cooking Equipment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  1. Cooking Equipment
                </span>
                <span className="text-[11px] text-stone-500 truncate max-w-[60%]">
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
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
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
                <div className="pt-1.5 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
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

                  {profile.equipment.includes("other") && (
                    <input
                      type="text"
                      value={profile.otherEquipmentLabel || ""}
                      onChange={(e) => onChangeOtherEquipmentLabel(e.target.value)}
                      placeholder="Specify other equipment (e.g., rice cooker, panini press)..."
                      maxLength={60}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Axis 2: Independent Effort Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  2. Desired Effort (Independent)
                </span>
                <span className="text-[11px] text-stone-500 truncate max-w-[55%]">
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
                      className={`min-h-[44px] px-2.5 py-2 rounded-xl text-left border transition-colors ${
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

          {/* Axis 3: Independent Living Situation & Dorm Context */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  3. Living Situation &amp; Storage Context (Optional)
                </span>
                <p className="text-[11px] text-stone-500">
                  Separate from equipment — Microwave-Only works in apartments too, and Dorm mode adapts storage, cookware, and shared hall kitchens.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onChangeLivingSituation("standard")}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    profile.livingSituation !== "dorm"
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLivingSituation("dorm")}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    profile.livingSituation === "dorm"
                      ? "bg-emerald-800 text-white border-emerald-800"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Dorm / College</span>
                </button>
              </div>
            </div>

            {profile.livingSituation === "dorm" && (
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-950">
                    Shared / Communal Dorm Kitchen:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: "none", label: "No shared kitchen" },
                        { id: "available_avoid", label: "Available (prefer in-room)" },
                        { id: "available_use", label: "Use shared stove & oven" }
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeSharedKitchen(opt.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          (profile.sharedKitchen ?? "none") === opt.id
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    Active Dorm Constraints:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DORM_CONSTRAINT_LABELS.map((item) => {
                      const active = dormConstraints[item.key];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => onToggleDormConstraint(item.key)}
                          aria-pressed={active}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            active
                              ? "bg-white text-emerald-900 border-emerald-500 ring-1 ring-emerald-500/20 font-semibold"
                              : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                          }`}
                        >
                          {active ? `✓ ${item.label}` : item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browse Filters & +3 Ideas */}
      <div className="pt-3 border-t border-stone-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectMethodFilter("all")}
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMethodFilter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Matching
          </button>

          {effectiveEq.has("microwave") && (
            <button
              type="button"
              onClick={() => onSelectMethodFilter("microwave")}
              className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
              className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMethodFilter === "healthy_boost"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Veggies / Produce
          </button>

          <select
            value={mealTypeFilter}
            onChange={(e) => onChangeMealTypeFilter(e.target.value as MealType)}
            aria-label="Filter by meal type"
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200 focus:outline-none"
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
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
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
                className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
          className="min-h-[44px] bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-950 border border-emerald-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
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
