import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Sparkles,
  Loader2,
  ChefHat,
  Eye,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Package,
  Refrigerator,
  Snowflake
} from "lucide-react";
import StorageTag from "./StorageTag";
import { KitchenProfile, Meal } from "../types";
import { PANTRY_STAPLE_GROUPS } from "../data/pantryStaples";
import {
  EFFORT_PRESETS,
  ENVIRONMENT_PRESETS,
  getEffectiveEquipment,
  getMealStorageProfile
} from "../utils/kitchenProfile";

interface IngredientRescueModalProps {
  profile: KitchenProfile;
  onGenerateOptions: (ingredients: string[], excludeTitles?: string[]) => Promise<Meal[]>;
  onCookOption: (meal: Meal, allOptions: Meal[]) => void;
  onViewOption: (meal: Meal, allOptions: Meal[]) => void;
  onCancel?: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function getCategoryLabel(category: Meal["category"]): string {
  switch (category) {
    case "microwave":
      return "Microwave";
    case "assembly":
      return "No-Cook";
    case "one_skillet":
      return "1 Skillet";
    case "sheet_pan":
      return "Oven / Tray";
    case "comfort":
      return "Classic";
    default:
      return "Easy Meal";
  }
}

export const IngredientRescueModal: React.FC<IngredientRescueModalProps> = ({
  profile,
  onGenerateOptions,
  onCookOption,
  onViewOption,
  onCancel,
  onClose,
  isLoading
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [mealOptions, setMealOptions] = useState<Meal[] | null>(null);
  const [seenOptionTitles, setSeenOptionTitles] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onClose]);

  const toggleIngredient = (item: string) => {
    const exists = selectedIngredients.some(
      (i) => i.toLowerCase() === item.toLowerCase()
    );
    if (exists) {
      setSelectedIngredients(
        selectedIngredients.filter((i) => i.toLowerCase() !== item.toLowerCase())
      );
    } else {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customInput.trim();
    if (
      cleaned &&
      !selectedIngredients.some((i) => i.toLowerCase() === cleaned.toLowerCase())
    ) {
      setSelectedIngredients([...selectedIngredients, cleaned]);
      setCustomInput("");
    }
  };

  const handleFetchOptions = async (isRefresh = false) => {
    if (selectedIngredients.length === 0 || isLoading) return;
    const exclude = isRefresh ? seenOptionTitles : [];
    const results = await onGenerateOptions(selectedIngredients, exclude);
    if (results.length > 0) {
      setMealOptions(results);
      setSeenOptionTitles((prev) =>
        [...prev, ...results.map((m) => m.title)].slice(-18)
      );
    }
  };

  const handleEditIngredients = () => {
    if (isLoading) {
      onCancel?.();
    }
    setMealOptions(null);
  };

  const isPickingStep = mealOptions !== null && mealOptions.length > 0;
  const envLabel =
    profile.environment === "custom"
      ? "Custom Kitchen"
      : ENVIRONMENT_PRESETS[profile.environment].shortLabel;
  const effectiveEq = getEffectiveEquipment(profile);
  const hasFridge = effectiveEq.has("fridge");
  const hasFreezer = effectiveEq.has("freezer");

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.();
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {isPickingStep ? "Pick a Meal Idea First" : "Quick Ingredient Rescue"}
              </h2>
              <p className="text-xs text-stone-600">
                {isPickingStep
                  ? "Compare 3 ideas tailored to your equipment before cooking"
                  : `${envLabel}${
                      profile.livingSituation === "dorm" ? " · Dorm" : ""
                    } · ${EFFORT_PRESETS[profile.effort].label}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isPickingStep ? (
          <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            <p className="text-xs text-stone-500">
              Built around:{" "}
              <span className="font-medium text-stone-700">
                {selectedIngredients.join(", ")}
              </span>
            </p>

            <div className="space-y-3">
              {mealOptions.map((option) => {
                const totalMinutes = option.prepMinutes + option.cookMinutes;
                const storage = getMealStorageProfile(option);
                return (
                  <div
                    key={option.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {option.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 font-medium">
                        <span>{getCategoryLabel(option.category)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{totalMinutes} min</span>
                        <span aria-hidden="true">·</span>
                        <span>{option.ingredients.length} ingredients</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                          {storage.requiresFreezer ? (
                            <Snowflake className="w-3 h-3" />
                          ) : storage.requiresFridge ? (
                            <Refrigerator className="w-3 h-3" />
                          ) : (
                            <Package className="w-3 h-3" />
                          )}
                          <span>
                            {storage.requiresFreezer
                              ? "Needs Freezer"
                              : storage.requiresFridge
                              ? "Needs Fridge"
                              : "Shelf-Stable"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-stone-700 leading-relaxed">
                      {option.tagline}
                    </p>

                    <div className="bg-white border border-stone-200 rounded-lg p-2.5 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        What This Needs
                      </div>
                      <ul className="space-y-1">
                        {option.ingredients.map((ing, i) => {
                          return (
                            <li
                              key={i}
                              className="text-xs text-stone-700 flex items-start justify-between gap-2"
                            >
                              <span className="flex items-start gap-1.5 min-w-0">
                                <ShoppingBag className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                                <span>
                                  <strong className="font-semibold text-stone-900">
                                    {ing.amount}
                                  </strong>{" "}
                                  {ing.item}
                                </span>
                              </span>
                              <span className="flex flex-col items-end gap-0.5 shrink-0">
                                <span className="text-[10px] text-stone-500">
                                  {ing.walmartAisle}
                                </span>
                                <StorageTag ingredient={ing} />
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onCookOption(option, mealOptions)}
                        className="flex-1 min-w-[130px] min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Cook This</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewOption(option, mealOptions)}
                        className="flex-1 min-w-[130px] min-h-[44px] bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View in Spotlight</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <p className="text-sm text-stone-600 leading-relaxed">
              Pick the random ingredients you have right now, and Simple Chef will preview 3 distinct meal options you can compare before deciding to cook.
            </p>

            {/* Custom Input */}
            <form onSubmit={handleAddCustom} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type an ingredient (e.g., black beans, rice pouch, tortillas)..."
                className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-stone-900"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="min-h-[44px] bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Selected Items */}
            {selectedIngredients.length > 0 && (
              <div className="space-y-1.5 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/70">
                <div className="text-xs font-semibold text-emerald-900">
                  Selected Ingredients ({selectedIngredients.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIngredients.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 bg-white text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-medium shadow-xs"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => toggleIngredient(item)}
                        className="text-stone-400 hover:text-rose-600 p-0.5"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grouped Quick Tap Staples */}
            <div className="space-y-4">
              {PANTRY_STAPLE_GROUPS.filter((group) => {
                if (!hasFreezer && group.label === "Freezer") return false;
                if (!hasFridge && group.label === "Fridge & Deli") return false;
                return true;
              }).map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {group.label}:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((staple) => {
                      const isSelected = selectedIngredients.some(
                        (i) => i.toLowerCase() === staple.toLowerCase()
                      );
                      return (
                        <button
                          key={staple}
                          type="button"
                          onClick={() => toggleIngredient(staple)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                              : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
                          }`}
                        >
                          {isSelected ? `✓ ${staple}` : staple}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          {isPickingStep ? (
            <>
              <button
                type="button"
                onClick={handleEditIngredients}
                className="min-h-[44px] text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5 py-2 px-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isLoading ? "Cancel & edit" : "Edit Ingredients"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFetchOptions(true)}
                disabled={isLoading}
                className="min-h-[44px] bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finding 3 more...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>3 New Ideas</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onCancel?.();
                  setSelectedIngredients([]);
                  setSeenOptionTitles([]);
                }}
                disabled={selectedIngredients.length === 0 && !isLoading}
                className="min-h-[44px] text-xs text-stone-500 hover:text-stone-800 disabled:opacity-40 font-medium px-2"
              >
                {isLoading ? "Cancel & clear" : "Clear selection"}
              </button>

              <button
                onClick={() => handleFetchOptions(false)}
                disabled={selectedIngredients.length === 0 || isLoading}
                className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finding 3 meal options...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Show 3 Meal Ideas ({selectedIngredients.length})</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
