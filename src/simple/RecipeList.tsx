import React from "react";
import type { KitchenSetup, Recipe } from "./types";
import { fits, haveCount, isClassic, missingReason } from "./logic";
import { TopBar } from "./TopBar";

export function RecipeCard({
  recipe,
  setup,
  onHand,
  showHave,
  onOpen,
}: {
  recipe: Recipe;
  setup: KitchenSetup;
  onHand: Set<string>;
  showHave: boolean;
  onOpen: (id: string) => void;
}) {
  const ok = fits(recipe, setup);
  return (
    <button className="meal-card" onClick={() => onOpen(recipe.id)}>
      <span className="plate" style={{ background: `var(--plate-${recipe.plate})` }}>
        {recipe.emoji}
      </span>
      <span className="txt">
        <b>{recipe.name}</b>
        <p>{recipe.description}</p>
        <span className="meta">
          <span>{recipe.minutes} min</span>
          <span>{recipe.ingredients.length} things</span>
          {recipe.fridge === 0 && <span className="nofridge">No fridge needed</span>}
          {isClassic(recipe, setup) && <span className="classic">Classic</span>}
          {recipe.generated && <span className="ai">New idea</span>}
          {showHave && onHand.size > 0 && (
            <span>
              Have {haveCount(recipe, onHand)}/{recipe.ingredients.length}
            </span>
          )}
          {!ok && <span className="needs">{missingReason(recipe, setup)}</span>}
        </span>
      </span>
    </button>
  );
}

interface RecipeListProps {
  title: string;
  subtitle: string;
  recipes: Recipe[];
  setup: KitchenSetup;
  onHand: Set<string>;
  /** Split into "fits" and "needs something you don't have". Off for 3 ideas and favorites. */
  splitByFit: boolean;
  showHave?: boolean;
  emptyText: string;
  onOpen: (id: string) => void;
  onBack: () => void;
  onHome: () => void;
  footer?: React.ReactNode;
}

export function RecipeListScreen({
  title,
  subtitle,
  recipes,
  setup,
  onHand,
  splitByFit,
  showHave = false,
  emptyText,
  onOpen,
  onBack,
  onHome,
  footer,
}: RecipeListProps) {
  const main = splitByFit ? recipes.filter((r) => fits(r, setup)) : recipes;
  const others = splitByFit ? recipes.filter((r) => !fits(r, setup)) : [];
  const card = (r: Recipe) => (
    <React.Fragment key={r.id}>
      <RecipeCard recipe={r} setup={setup} onHand={onHand} showHave={showHave} onOpen={onOpen} />
    </React.Fragment>
  );
  return (
    <section className="screen">
      <TopBar title={title} onBack={onBack} onHome={onHome} />
      <div className="stack">
        <p className="lede" style={{ margin: 0 }}>
          {subtitle}
        </p>
        <div className="meal-list">{main.length ? main.map(card) : <div className="empty">{emptyText}</div>}</div>
        {footer}
        {others.length > 0 && (
          <div>
            <p className="section-title" style={{ marginTop: 10 }}>
              Needs something you don't have ({others.length})
            </p>
            <p className="lede" style={{ margin: "0 0 10px", fontSize: ".9rem" }}>
              Tap one to see it anyway, or change your kitchen.
            </p>
            <div className="meal-list dim">{others.map(card)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
