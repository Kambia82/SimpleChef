import React, { useState, useEffect } from "react";
import { RutMeal, VarietyPreference } from "../types";
import { X, Plus, Trash2, SlidersHorizontal, Sparkles } from "lucide-react";

interface RutManagerModalProps {
  rutMeals: RutMeal[];
  varietyPreference: VarietyPreference;
  onChangeVarietyPreference: (pref: VarietyPreference) => void;
  onAddRutMeal: (name: string) => void;
  onRemoveRutMeal: (id: string) => void;
  onClose: () => void;
  onRequestSwap?: (comfortFoodName: string) => void;
}

const VARIETY_OPTIONS: Array<{
  id: VarietyPreference;
  label: string;
  description: string;
}> = [
  {
    id: "familiar",
    label: "Familiar Comforts",
    description: "Welcome classic go-tos (nachos, ramen, mac & cheese) plus easy twists."
  },
  {
    id: "balanced",
    label: "Balanced Mix",
    description: "Blend comforting favorites with fresh ideas and simple variations."
  },
  {
    id: "new_ideas",
    label: "Mostly New Ideas",
    description: "Prioritize fresh dishes and show your 'see less often' list lower."
  }
];

export const RutManagerModal: React.FC<RutManagerModalProps> = ({
  rutMeals,
  varietyPreference,
  onChangeVarietyPreference,
  onAddRutMeal,
  onRemoveRutMeal,
  onClose,
  onRequestSwap
}) => {
  const [newMealName, setNewMealName] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newMealName.trim();
    if (cleaned) {
      const alreadyExists = rutMeals.some(
        (r) => r.name.toLowerCase() === cleaned.toLowerCase()
      );
      if (!alreadyExists) {
        onAddRutMeal(cleaned);
      }
      setNewMealName("");
    }
  };

  const quickComfortExamples = [
    "Chips and salsa",
    "Boxed mac & cheese",
    "Instant ramen",
    "Frozen pizza",
    "Cereal",
    "Grilled cheese"
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Meal Variety &amp; Comfort Preferences
              </h2>
              <p className="text-xs text-stone-600">
                You control what feels good — familiar staples, upgrades, or new ideas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Variety Style Selector */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
              How should Simple Chef pick ideas?
            </div>
            <div className="grid grid-cols-1 gap-2">
              {VARIETY_OPTIONS.map((opt) => {
                const selected = varietyPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeVarietyPreference(opt.id)}
                    className={`text-left p-3 rounded-xl border transition-colors ${
                      selected
                        ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600/30"
                        : "bg-white border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="text-sm font-bold text-stone-900">{opt.label}</div>
                    <div className="text-xs text-stone-600 mt-0.5">{opt.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 space-y-3">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              There&apos;s nothing wrong with eating familiar comfort foods. If there are specific meals you&apos;d simply like to <strong>see less often</strong> or want an <strong>easy upgraded variation</strong> for (like turning chips &amp; salsa into loaded nachos or a quesadilla), manage them optionally below.
            </p>

            {/* Form to add */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                placeholder="Optional: food to see less often or upgrade..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-stone-900"
              />
              <button
                type="submit"
                disabled={!newMealName.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Current List */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                See Less Often ({rutMeals.length}):
              </div>
              {rutMeals.length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-center text-xs text-stone-500">
                  Nothing filtered out. All comfort meals and new ideas are welcome.
                </div>
              ) : (
                <ul className="space-y-2">
                  {rutMeals.map((meal) => (
                    <li
                      key={meal.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900"
                    >
                      <span className="font-medium">{meal.name}</span>

                      <div className="flex items-center gap-2">
                        {onRequestSwap && (
                          <button
                            type="button"
                            onClick={() => {
                              onRequestSwap(meal.name);
                              onClose();
                            }}
                            className="text-xs text-emerald-800 hover:bg-emerald-100 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 bg-white transition-colors flex items-center gap-1"
                            title="Generate an optional variation or upgrade"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-700" />
                            <span>Try a Twist</span>
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveRutMeal(meal.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove from list"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Optional quick comfort classics to upgrade or dial back */}
            <div className="pt-1">
              <div className="text-xs font-semibold text-stone-500 mb-2">
                Quick add (to dial back or generate twists):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickComfortExamples.map((item) => {
                  const alreadyAdded = rutMeals.some(
                    (r) => r.name.toLowerCase() === item.toLowerCase()
                  );
                  if (alreadyAdded) return null;
                  return (
                    <button
                      key={item}
                      onClick={() => onAddRutMeal(item)}
                      className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-400" />
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
