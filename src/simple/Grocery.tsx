import React from "react";
import type { GroceryEntry, Recipe } from "./types";
import { AISLES, scaledAmount } from "./logic";
import { TopBar } from "./TopBar";

interface GroceryProps {
  entries: GroceryEntry[];
  recipes: Recipe[];
  onHand: Set<string>;
  onRemove: (recipeId: string) => void;
  onClear: () => void;
  onBack: () => void;
  onHome: () => void;
}

export function GroceryScreen({ entries, recipes, onHand, onRemove, onClear, onBack, onHome }: GroceryProps) {
  const lines = entries.flatMap((entry) => {
    const recipe = recipes.find((r) => r.id === entry.recipeId);
    if (!recipe) return [];
    return recipe.ingredients.map((ing) => ({ ...ing, amount: scaledAmount(ing, entry.servings), meal: recipe.name }));
  });
  const need = lines.filter((l) => !onHand.has(l.key));
  const have = lines.filter((l) => onHand.has(l.key));
  const meals = entries.map((e) => recipes.find((r) => r.id === e.recipeId)).filter((r): r is Recipe => Boolean(r));

  return (
    <section className="screen">
      <TopBar title="Grocery list" onBack={onBack} onHome={onHome} />
      <div className="stack">
        {meals.length === 0 ? (
          <div className="empty">
            Open any meal and tap <b>Add to list</b>. Items get sorted by Walmart aisle.
          </div>
        ) : (
          <>
            <p className="lede" style={{ margin: 0 }}>
              {meals.length} {meals.length === 1 ? "meal" : "meals"} · {need.length} to buy
              {have.length ? ` · ${have.length} already have` : ""}
            </p>
            {AISLES.map((aisle) => {
              const items = need.filter((l) => l.aisle === aisle);
              if (!items.length) return null;
              return (
                <div className="card" key={aisle}>
                  <h3>{aisle}</h3>
                  <ul className="ing">
                    {items.map((l, i) => (
                      <li key={i}>
                        <span>
                          <span className="amt">{l.amount}</span> {l.name}
                        </span>
                        <span className="have" style={{ color: "var(--muted)", fontWeight: 600 }}>
                          {l.meal.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {have.length > 0 && (
              <div className="card">
                <h3>Already have</h3>
                <ul className="ing">
                  {have.map((l, i) => (
                    <li key={i}>
                      <span>{l.name}</span>
                      <span className="have">✓</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="card">
              <h3>Meals on this list</h3>
              <ul className="ing">
                {meals.map((m) => (
                  <li key={m.id}>
                    <span>{m.name}</span>
                    <button className="btn-ghost" style={{ border: 0, background: "none", fontWeight: 700 }} onClick={() => onRemove(m.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn btn-ghost btn-block" onClick={onClear}>
              Clear list
            </button>
          </>
        )}
      </div>
    </section>
  );
}
