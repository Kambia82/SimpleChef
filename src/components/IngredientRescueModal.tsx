import React, { useState } from "react";
import { X, Plus, Sparkles, Loader2, Check } from "lucide-react";

interface IngredientRescueModalProps {
  onRescue: (ingredients: string[]) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const COMMON_STAPLES = [
  "Tortillas",
  "Eggs",
  "Canned Black Beans",
  "Rotisserie Chicken",
  "Shredded Cheese",
  "Salsa",
  "Frozen Veggies",
  "Microwave Rice",
  "Pasta",
  "Pasta Sauce",
  "Spinach",
  "Ground Beef / Turkey",
  "Sweet Potato",
  "Kielbasa / Sausage",
  "Greek Yogurt",
  "Naan Bread"
];

export const IngredientRescueModal: React.FC<IngredientRescueModalProps> = ({
  onRescue,
  onClose,
  isLoading
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const toggleIngredient = (item: string) => {
    if (selectedIngredients.includes(item)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== item));
    } else {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !selectedIngredients.includes(customInput.trim())) {
      setSelectedIngredients([...selectedIngredients, customInput.trim()]);
      setCustomInput("");
    }
  };

  const handleRun = async () => {
    if (selectedIngredients.length > 0) {
      await onRescue(selectedIngredients);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <p className="text-sm text-stone-600 leading-relaxed">
            "I bought random groceries and have no idea how to make a meal out of them." Tap what you have in your kitchen, and we'll do the mental math to give you a dead-simple 3-step meal.
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

          {/* Quick Tap Staples */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Tap items you have on hand:
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_STAPLES.map((staple) => {
                const isSelected = selectedIngredients.includes(staple);
                return (
                  <button
                    key={staple}
                    type="button"
                    onClick={() => toggleIngredient(staple)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedIngredients([])}
            disabled={selectedIngredients.length === 0}
            className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-40 font-medium"
          >
            Clear selection
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
