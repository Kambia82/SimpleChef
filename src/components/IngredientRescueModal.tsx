import React, { useState, useEffect } from "react";
import { X, Plus, Sparkles, Loader2 } from "lucide-react";
import { PANTRY_STAPLE_GROUPS } from "../data/pantryStaples";

interface IngredientRescueModalProps {
  onRescue: (ingredients: string[]) => Promise<void>;
  onCancel?: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const IngredientRescueModal: React.FC<IngredientRescueModalProps> = ({
  onRescue,
  onCancel,
  onClose,
  isLoading
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

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

  const handleRun = async () => {
    if (selectedIngredients.length > 0) {
      await onRescue(selectedIngredients);
    }
  };

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
              <h2 className="text-lg font-bold text-stone-900">Rescue My Random Ingredients</h2>
              <p className="text-xs text-stone-600">Turn groceries into dinner without overthinking</p>
            </div>
          </div>
          <button
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <p className="text-sm text-stone-600 leading-relaxed">
            Tap whatever ingredients you already have in your kitchen, and we&apos;ll turn them into a simple 3-step meal.
          </p>

          {/* Custom Input */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type an ingredient (e.g., canned corn, cream cheese)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-stone-900"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Selected Pills */}
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
                      className="text-stone-400 hover:text-rose-600"
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
            {PANTRY_STAPLE_GROUPS.map((group) => (
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

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onCancel?.();
              setSelectedIngredients([]);
            }}
            disabled={selectedIngredients.length === 0 && !isLoading}
            className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-40 font-medium"
          >
            {isLoading ? "Cancel & clear" : "Clear selection"}
          </button>

          <button
            onClick={handleRun}
            disabled={selectedIngredients.length === 0 || isLoading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking up an easy meal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Make a Meal From These ({selectedIngredients.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
