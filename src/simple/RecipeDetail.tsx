import React, { useEffect, useState } from "react";
import type { KitchenSetup, Recipe } from "./types";
import { fillStep, fits, isClassic, missingReason, scaledAmount } from "./logic";
import { TopBar } from "./TopBar";
import { HeartIcon } from "./icons";

interface RecipeDetailProps {
  recipe: Recipe;
  setup: KitchenSetup;
  onHand: Set<string>;
  servings: number;
  onServings: (n: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToList: () => void;
  /** Shown when the meal came from "Pick for me". */
  onSomethingElse?: () => void;
  onBack: () => void;
  onHome: () => void;
}

export function RecipeDetail({
  recipe,
  setup,
  onHand,
  servings,
  onServings,
  isFavorite,
  onToggleFavorite,
  onAddToList,
  onSomethingElse,
  onBack,
  onHome,
}: RecipeDetailProps) {
  const [cooking, setCooking] = useState(false);
  const ok = fits(recipe, setup);
  return (
    <section className="screen">
      <TopBar onBack={onBack} onHome={onHome} />
      <div className="stack">
        <div className="detail-hero">
          <span className="plate" style={{ background: `var(--plate-${recipe.plate})` }}>
            {recipe.emoji}
          </span>
          <h1>{recipe.name}</h1>
          <p className="lede" style={{ margin: 0, maxWidth: "34ch" }}>
            {recipe.description}
          </p>
          <div className="meta" style={{ justifyContent: "center" }}>
            <span>{recipe.minutes} min</span>
            <span>{recipe.ingredients.length} things</span>
            {recipe.fridge === 0 && <span className="nofridge">No fridge needed</span>}
            {isClassic(recipe, setup) && <span className="classic">Classic</span>}
            {!ok && <span className="needs">{missingReason(recipe, setup)}</span>}
          </div>
        </div>

        <div className="formula">
          <span className="eyebrow">Remember it as</span>
          <p>{recipe.rememberAs}</p>
        </div>

        <div className="card">
          <h3>
            You'll need
            <span className="stepper">
              <button onClick={() => onServings(Math.max(1, servings - 1))} aria-label="Fewer servings">
                −
              </button>
              <span>
                {servings} {servings === 1 ? "serving" : "servings"}
              </span>
              <button onClick={() => onServings(Math.min(12, servings + 1))} aria-label="More servings">
                +
              </button>
            </span>
          </h3>
          <ul className="ing">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <span>
                  <span className="amt">{scaledAmount(ing, servings)}</span> {ing.name}
                </span>
                {onHand.has(ing.key) && <span className="have">✓ Have it</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Steps</h3>
          <ol className="steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>
                <span>{fillStep(recipe, step, servings)}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.lazyVersion && (
          <div className="lazy">
            <b>Lazy version</b>
            {fillStep(recipe, recipe.lazyVersion, servings)}
          </div>
        )}

        {onSomethingElse && (
          <button className="btn btn-soft btn-block" onClick={onSomethingElse}>
            Something else
          </button>
        )}
      </div>

      <div className="footer-actions">
        <button className="btn btn-primary btn-block" onClick={() => setCooking(true)}>
          Start cooking
        </button>
        <div className="row">
          <button className="btn btn-soft" onClick={onAddToList}>
            Add to list
          </button>
          <button className="btn btn-soft fav" aria-pressed={isFavorite} onClick={onToggleFavorite}>
            <HeartIcon size={20} /> Save
          </button>
        </div>
      </div>

      {cooking && <CookMode recipe={recipe} servings={servings} onClose={() => setCooking(false)} />}
    </section>
  );
}

/** One big step at a time, so there's only one thing to remember. */
function CookMode({ recipe, servings, onClose }: { recipe: Recipe; servings: number; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const total = recipe.steps.length;
  const last = step === total - 1;

  // Keep the screen on while cooking, where the browser allows it.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => undefined);
    return () => {
      lock?.release().catch(() => undefined);
    };
  }, []);

  return (
    <div className="cook" role="dialog" aria-label={`Cooking ${recipe.name}`}>
      <div className="inner">
        <div className="topbar" style={{ position: "static" }}>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="progress">
            {recipe.steps.map((_, i) => (
              <span key={i} className={i <= step ? "on" : ""} />
            ))}
          </div>
        </div>
        <div className="bigstep">
          <span className="eyebrow">
            Step {step + 1} of {total}
          </span>
          <p>{fillStep(recipe, recipe.steps[step], servings)}</p>
        </div>
        <div className="row">
          <button className="btn btn-soft" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button className="btn btn-primary" onClick={() => (last ? onClose() : setStep(step + 1))}>
            {last ? "Done! 🎉" : "Next step"}
          </button>
        </div>
      </div>
    </div>
  );
}
