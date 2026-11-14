import React, { useState, useEffect } from "react";
import { GroceryItem, WalmartAisle } from "../types";
import { X, Check, Copy, Trash2, ShoppingCart, Plus, PackageCheck } from "lucide-react";

interface GroceryListModalProps {
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
  onMoveCompletedToPantry?: () => void;
  onClearAll: () => void;
  onAddItem: (name: string, aisle: WalmartAisle) => void;
  onClose: () => void;
}

const AISLE_ORDER: WalmartAisle[] = [
  "Produce",
  "Meat & Deli",
  "Dairy & Eggs",
  "Pantry / Canned",
  "Frozen",
  "Bakery",
  "Spices & Condiments"
];

export const GroceryListModal: React.FC<GroceryListModalProps> = ({
  items,
  onToggleItem,
  onRemoveItem,
  onClearCompleted,
  onMoveCompletedToPantry,
  onClearAll,
  onAddItem,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [selectedAisle, setSelectedAisle] = useState<WalmartAisle>("Pantry / Canned");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const completedCount = items.filter((i) => i.completed).length;

  // Group items by aisle
  const groupedItems = AISLE_ORDER.reduce((acc, aisle) => {
    const matching = items.filter((item) => item.aisle === aisle);
    if (matching.length > 0) {
      acc[aisle] = matching;
    }
    return acc;
  }, {} as Record<WalmartAisle, GroceryItem[]>);

  // Check for any unlisted aisles
  const remaining = items.filter((item) => !AISLE_ORDER.includes(item.aisle));
  if (remaining.length > 0) {
    groupedItems["Pantry / Canned"] = [...(groupedItems["Pantry / Canned"] || []), ...remaining];
  }

  const handleCopy = async () => {
    if (items.length === 0) return;

    let text = "🛒 WALMART EASY MEAL SHOPPING LIST\n";
    text += "---------------------------------\n";

    Object.entries(groupedItems).forEach(([aisle, aisleItems]) => {
      text += `\n📍 ${aisle.toUpperCase()}\n`;
      aisleItems.forEach((item) => {
        text += `[${item.completed ? "x" : " "}] ${item.amount ? item.amount + " " : ""}${item.name} (${item.mealTitle})\n`;
      });
    });

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim(), selectedAisle);
      setNewItemName("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Walmart Aisle Shopping List</h2>
              <p className="text-xs text-emerald-200">
                {items.length} items total • {completedCount} checked off
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

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Quick Copy Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-3.5 rounded-xl">
            <div className="text-xs text-stone-600">
              Grouped by Walmart store section so you walk straight through.
            </div>
            <button
              onClick={handleCopy}
              disabled={items.length === 0}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied for Walmart!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy for Walmart App / Notes</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Add Custom Item */}
          <form onSubmit={handleAddCustomItem} className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add extra item (e.g. paper towels, butter)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-stone-900"
            />
            <select
              value={selectedAisle}
              onChange={(e) => setSelectedAisle(e.target.value as WalmartAisle)}
              className="px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800"
            >
              {AISLE_ORDER.map((aisle) => (
                <option key={aisle} value={aisle}>
                  {aisle}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* List grouped by aisle */}
          {items.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-stone-700 font-semibold text-sm">Your shopping list is empty</div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Tap the shopping bag icon on any meal to instantly load its 3-5 ingredients here organized by Walmart aisle.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedItems).map(([aisle, aisleItems]) => (
                <div key={aisle} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      {aisle}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {aisleItems.filter((i) => i.completed).length}/{aisleItems.length} checked
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {aisleItems.map((item) => (
                      <li
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all ${
                          item.completed
                            ? "bg-stone-50 border-stone-200 text-stone-400"
                            : "bg-white border-stone-200 text-stone-900 hover:bg-stone-50"
                        }`}
                      >
                        <div
                          onClick={() => onToggleItem(item.id)}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                              item.completed
                                ? "bg-emerald-600 text-white"
                                : "border-2 border-stone-300 bg-white"
                            }`}
                          >
                            {item.completed && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className={item.completed ? "line-through" : "font-medium"}>
                              {item.amount ? `${item.amount} ` : ""}
                              {item.name}
                            </span>
                            <span className="block text-[11px] text-stone-400">
                              For: {item.mealTitle}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-stone-300 hover:text-rose-600 rounded transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {items.length > 0 && completedCount > 0 && onMoveCompletedToPantry && (
              <button
                onClick={onMoveCompletedToPantry}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Move {completedCount} to Pantry</span>
              </button>
            )}
            {items.length > 0 && completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium px-2 py-1"
              >
                Clear {completedCount} completed
              </button>
            )}
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
