import React, { useState } from "react";
import { RutMeal } from "../types";
import { X, Plus, Trash2, ShieldAlert, Sparkles, Check } from "lucide-react";

interface RutManagerModalProps {
  rutMeals: RutMeal[];
  onAddRutMeal: (name: string) => void;
  onRemoveRutMeal: (id: string) => void;
  onClose: () => void;
  onRequestSwap?: (rutName: string) => void;
}

export const RutManagerModal: React.FC<RutManagerModalProps> = ({
  rutMeals,
  onAddRutMeal,
  onRemoveRutMeal,
  onClose,
  onRequestSwap
}) => {
  const [newMealName, setNewMealName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMealName.trim()) {
      onAddRutMeal(newMealName.trim());
      setNewMealName("");
    }
  };

  const commonRuts = [
    "Chips and salsa",
    "Boxed mac & cheese",
    "Ramen noodles",
    "Frozen pizza",
    "Cereal for dinner",
    "Peanut butter on crackers",
    "Fast food drive-thru"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">My Repetitive Rut List</h2>
              <p className="text-xs text-stone-600">The foods you keep eating because memory is fried</p>
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
            Whenever your brain gets overwhelmed, you naturally default to the 2-3 items on your Walmart list.
            Add them here so the app will <strong>never recommend them</strong> and can suggest effortless healthy swaps instead!
          </p>

          {/* Form to add */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              placeholder="e.g. Chips & salsa, Hot dogs, Ramen..."
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

          {/* Current Rut List */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Currently Avoiding ({rutMeals.length}):
            </div>
            {rutMeals.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-center text-xs text-stone-500">
                No rut meals listed yet. Add what you usually buy at Walmart so we can give you new ideas!
              </div>
            ) : (
              <ul className="space-y-2">
                {rutMeals.map((meal) => (
                  <li
                    key={meal.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-sm text-stone-900"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-medium">{meal.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onRequestSwap && (
                        <button
                          type="button"
                          onClick={() => {
                            onRequestSwap(meal.name);
                            onClose();
                          }}
                          className="text-xs text-emerald-800 hover:bg-emerald-100 font-semibold px-2 py-1 rounded transition-colors flex items-center gap-1"
                          title="Generate a healthy swap"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-700" />
                          <span>Find Swap</span>
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

          {/* Quick Add Suggestions */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-stone-500 mb-2">
              Common go-to ruts (click to add):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {commonRuts.map((item) => {
                const alreadyAdded = rutMeals.some((r) => r.name.toLowerCase() === item.toLowerCase());
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
