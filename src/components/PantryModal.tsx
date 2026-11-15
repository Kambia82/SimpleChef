import React, { useState, useEffect } from "react";
import { X, Plus, Minus, PackageCheck, Sparkles, Loader2, Trash2 } from "lucide-react";
import { KitchenProfile, PantryItem } from "../types";
import { PANTRY_STAPLE_GROUPS } from "../data/pantryStaples";
import { getEffectiveEquipment } from "../utils/kitchenProfile";

interface PantryModalProps {
  pantryItems: PantryItem[];
  matchingMealCount: number;
  isSuggesting: boolean;
  profile: KitchenProfile;
  onTogglePantryItem: (itemName: string) => void;
  onAddPantryItem: (itemName: string) => void;
  onUpdatePantryQuantity: (itemName: string, delta: number) => void;
  onClearPantry: () => void;
  onRequestMoreSuggestions: () => void;
  onClose: () => void;
}

export const PantryModal: React.FC<PantryModalProps> = ({
  pantryItems,
  matchingMealCount,
  isSuggesting,
  profile,
  onTogglePantryItem,
  onAddPantryItem,
  onUpdatePantryQuantity,
  onClearPantry,
  onRequestMoreSuggestions,
  onClose
}) => {
  const [customInput, setCustomInput] = useState("");
  const totalUnits = pantryItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customInput.trim();
    if (cleaned) {
      onAddPantryItem(cleaned);
      setCustomInput("");
    }
  };

  const effectiveEq = getEffectiveEquipment(profile);
  const hasFridge = effectiveEq.has("fridge");
  const hasFreezer = effectiveEq.has("freezer");
  const title = hasFreezer
    ? "My Pantry, Fridge & Freezer"
    : hasFridge
    ? "My Pantry & Fridge"
    : "My Shelf-Stable Pantry";

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <PackageCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-xs text-emerald-200">
                {pantryItems.length} items ({totalUnits} total qty) · {matchingMealCount} matching meal ideas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm text-emerald-950 leading-relaxed">
            Tap what you currently have on hand—or add your own ingredients below. Adjust quantities with <strong>+ / -</strong> so Simple Chef tracks exact availability and acceptable swaps accurately.
          </div>

          {/* Add custom pantry item */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type anything in your kitchen (e.g., ground beef, jasmine rice, broccoli)..."
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

          {/* Current Pantry Items with quantities */}
          {pantryItems.length > 0 && (
            <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  In Your Kitchen ({pantryItems.length})
                </span>
                <button
                  type="button"
                  onClick={onClearPantry}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear all</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item) => (
                  <div
                    key={item.name}
                    className="inline-flex items-center gap-1.5 bg-white text-emerald-950 border border-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-xs"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <div className="flex items-center gap-1 bg-stone-100 rounded-lg px-1 py-0.5 ml-1">
                      <button
                        type="button"
                        onClick={() => onUpdatePantryQuantity(item.name, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-stone-200 text-stone-700"
                        aria-label={`Decrease ${item.name} quantity`}
                        title={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-[1.25rem] text-center font-bold text-emerald-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdatePantryQuantity(item.name, 1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-stone-200 text-stone-700"
                        aria-label={`Increase ${item.name} quantity`}
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onTogglePantryItem(item.name)}
                      className="text-stone-400 hover:text-rose-600 ml-0.5"
                      aria-label={`Remove ${item.name}`}
                      title="Remove from pantry"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                    const match = pantryItems.find(
                      (p) => p.name.toLowerCase() === staple.toLowerCase()
                    );
                    const isSelected = Boolean(match);
                    return (
                      <button
                        key={staple}
                        type="button"
                        onClick={() => onTogglePantryItem(staple)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                          isSelected
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                            : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
                        }`}
                      >
                        {isSelected
                          ? `✓ ${staple}${match && match.quantity > 1 ? ` ×${match.quantity}` : ""}`
                          : staple}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRequestMoreSuggestions}
            disabled={pantryItems.length === 0 || isSuggesting}
            className="bg-amber-50 hover:bg-amber-100 disabled:opacity-40 text-amber-900 border border-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {isSuggesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Finding new meals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Suggest Meals From Pantry</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            See {matchingMealCount} Matching Meals
          </button>
        </div>
      </div>
    </div>
  );
};
