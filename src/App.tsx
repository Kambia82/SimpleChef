import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GroceryEntry, KitchenSetup, Recipe } from "./simple/types";
import { RECIPES } from "./simple/recipes";
import { classicsLabel, fits, fridgeLevel, haveCount, isClassic, mealTypeForHour, pickOne, shuffle } from "./simple/logic";
import { fetchAiIdeas } from "./simple/ai";
import {
  KitchenScreen,
  OnHandScreen,
  ServingsScreen,
  WelcomeScreen,
  draftToSetup,
  type SetupDraft,
} from "./simple/Onboarding";
import { HomeScreen, type MenuAction } from "./simple/Home";
import { RecipeListScreen } from "./simple/RecipeList";
import { RecipeDetail } from "./simple/RecipeDetail";
import { GroceryScreen } from "./simple/Grocery";

type Screen = "welcome" | "kitchen" | "servings" | "onhand" | "home" | "list" | "detail" | "grocery";
type ListMode = "three" | "low" | "classics" | "usehave" | "favs";

interface Saved {
  setup: KitchenSetup | null;
  onHand: string[];
  favorites: string[];
  grocery: GroceryEntry[];
  aiRecipes: Recipe[];
}

const STORAGE_KEY = "simple_chef_v2";
const EMPTY: Saved = { setup: null, onHand: [], favorites: [], grocery: [], aiRecipes: [] };

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Saved>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const NEW_DRAFT: SetupDraft = {
  kitchen: null,
  appliances: ["stove", "oven", "microwave"],
  fridge: null,
  microwave: null,
  servings: 1,
};

export default function App() {
  const initial = useMemo(load, []);
  const [setup, setSetup] = useState<KitchenSetup | null>(initial.setup);
  const [onHand, setOnHand] = useState<Set<string>>(new Set(initial.onHand));
  const [favorites, setFavorites] = useState<Set<string>>(new Set(initial.favorites));
  const [grocery, setGrocery] = useState<GroceryEntry[]>(initial.grocery);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>(initial.aiRecipes);

  const [screen, setScreen] = useState<Screen>(initial.setup ? "home" : "welcome");
  const [history, setHistory] = useState<Screen[]>([]);
  const [draft, setDraft] = useState<SetupDraft>(NEW_DRAFT);
  const [onboarding, setOnboarding] = useState(false);
  const [listMode, setListMode] = useState<ListMode>("low");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [fromPick, setFromPick] = useState(false);
  const [servings, setServings] = useState(1);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | string>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const saved: Saved = {
      setup,
      onHand: [...onHand],
      favorites: [...favorites],
      grocery,
      aiRecipes: aiRecipes.slice(0, 30),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Storage can be unavailable (private mode); the app still works for this visit.
    }
  }, [setup, onHand, favorites, grocery, aiRecipes]);

  const allRecipes = useMemo(() => [...aiRecipes, ...RECIPES], [aiRecipes]);
  const findRecipe = (id: string | null) => allRecipes.find((r) => r.id === id) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };
  const go = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
    window.scrollTo(0, 0);
  };
  const back = () => {
    setHistory((h) => {
      const prev = h[h.length - 1] ?? (setup ? "home" : "welcome");
      setScreen(prev);
      return h.slice(0, -1);
    });
    window.scrollTo(0, 0);
  };
  const goHome = () => {
    setHistory([]);
    setScreen("home");
    window.scrollTo(0, 0);
  };

  const openRecipe = (id: string, viaPick = false) => {
    setCurrentId(id);
    setFromPick(viaPick);
    setServings(setup?.servings ?? 1);
    go("detail");
  };

  const startSetup = (existing: KitchenSetup | null) => {
    setDraft(
      existing
        ? { ...existing, fridge: existing.fridge, microwave: existing.microwave }
        : NEW_DRAFT
    );
    setOnboarding(true);
    go("kitchen");
  };

  const finishSetup = () => {
    setSetup(draftToSetup(draft));
    setOnboarding(false);
    goHome();
  };

  const toggle = (set: Set<string>, key: string) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  };

  const newIdeas = (s: KitchenSetup, exclude: string[] = []) => {
    const fitting = RECIPES.filter((r) => fits(r, s));
    const fresh = shuffle(fitting.filter((r) => !exclude.includes(r.id)));
    return [...fresh, ...shuffle(fitting.filter((r) => exclude.includes(r.id)))].slice(0, 3).map((r) => r.id);
  };

  const handleMenu = (action: MenuAction) => {
    if (!setup) return;
    switch (action) {
      case "pick": {
        const recipe = pickOne(RECIPES, setup, mealTypeForHour(new Date().getHours()));
        if (recipe) openRecipe(recipe.id, true);
        else showToast("No meals fit this setup yet");
        break;
      }
      case "three":
        setIdeas(newIdeas(setup));
        setAiStatus("idle");
        setListMode("three");
        go("list");
        break;
      case "grocery":
        go("grocery");
        break;
      case "setup":
        startSetup(setup);
        break;
      default:
        setListMode(action);
        go("list");
    }
  };

  const getAiIdeas = async () => {
    if (!setup) return;
    setAiStatus("loading");
    try {
      const recipes = await fetchAiIdeas(
        setup,
        mealTypeForHour(new Date().getHours()),
        [...onHand],
        allRecipes.map((r) => r.name)
      );
      if (recipes.length === 0) throw new Error("No new ideas came back. Try again.");
      setAiRecipes((prev) => [...recipes, ...prev].slice(0, 30));
      setIdeas(recipes.map((r) => r.id));
      setAiStatus("idle");
    } catch (err) {
      setAiStatus(err instanceof Error && err.name !== "AbortError" ? err.message : "New ideas aren't available right now.");
    }
  };

  let content: React.ReactNode = null;

  if (screen === "welcome") {
    content = <WelcomeScreen onStart={() => startSetup(null)} />;
  } else if (screen === "kitchen") {
    content = <KitchenScreen draft={draft} onChange={setDraft} onNext={() => go("servings")} onBack={back} />;
  } else if (screen === "servings") {
    content = <ServingsScreen draft={draft} onChange={setDraft} onNext={() => go("onhand")} onBack={back} />;
  } else if (screen === "onhand") {
    content = (
      <OnHandScreen
        setup={onboarding ? draftToSetup(draft) : setup ?? draftToSetup(draft)}
        onHand={onHand}
        onToggle={(k) => setOnHand((s) => toggle(s, k))}
        onDone={onboarding ? finishSetup : back}
        onBack={back}
        fromOnboarding={onboarding}
      />
    );
  } else if (setup && screen === "home") {
    content = (
      <HomeScreen
        setup={setup}
        onHandCount={onHand.size}
        favoritesCount={favorites.size}
        groceryCount={grocery.length}
        onAction={handleMenu}
      />
    );
  } else if (setup && screen === "list") {
    const noFridge = fridgeLevel(setup) === 0;
    const lists: Record<ListMode, { title: string; subtitle: string; recipes: Recipe[]; split: boolean; empty: string }> = {
      three: {
        title: "3 ideas for you",
        subtitle: "Tap one to see how it's made.",
        recipes: ideas.map(findRecipe).filter((r): r is Recipe => Boolean(r)),
        split: false,
        empty: "Nothing fits your setup yet. Try changing your kitchen.",
      },
      low: {
        title: "Low effort",
        subtitle: "Few ingredients, few steps, almost no cleanup.",
        recipes: RECIPES.filter((r) => r.lowEffort).sort((a, b) => a.minutes - b.minutes),
        split: true,
        empty: "None of these fit your setup yet. See below, or change your kitchen.",
      },
      classics: {
        title: classicsLabel(setup),
        subtitle: noFridge ? "Comfort food that keeps on a shelf. No fridge needed." : "Dishes you already love, with the hard parts skipped.",
        recipes: RECIPES.filter((r) => isClassic(r, setup)),
        split: true,
        empty: "None of these fit your setup yet. See below, or change your kitchen.",
      },
      usehave: {
        title: "Use what I have",
        subtitle: onHand.size ? "Meals that use the most of what you have." : "Tell us what you have to sort these.",
        recipes: [...RECIPES].sort((a, b) => haveCount(b, onHand) - haveCount(a, onHand)),
        split: true,
        empty: "None of these fit your setup yet. See below, or change your kitchen.",
      },
      favs: {
        title: "Favorites",
        subtitle: "Meals you saved.",
        recipes: allRecipes.filter((r) => favorites.has(r.id)),
        split: false,
        empty: "Tap Save on any meal to keep it here.",
      },
    };
    const list = lists[listMode];
    let footer: React.ReactNode = null;
    if (listMode === "three") {
      footer = (
        <div className="stack" style={{ gap: 8 }}>
          <button className="btn btn-soft btn-block" onClick={() => setIdeas(newIdeas(setup, ideas))}>
            Show 3 different ideas
          </button>
          <button className="btn btn-ghost btn-block" disabled={aiStatus === "loading"} onClick={getAiIdeas}>
            {aiStatus === "loading" ? "Thinking up new ideas…" : "Get 3 brand-new ideas"}
          </button>
          {aiStatus !== "idle" && aiStatus !== "loading" && <p className="ai-status">{aiStatus}</p>}
        </div>
      );
    } else if (listMode === "usehave") {
      footer = (
        <button className="btn btn-soft btn-block" onClick={() => go("onhand")}>
          {onHand.size ? "Update what I have" : "Add what I have"}
        </button>
      );
    }
    content = (
      <RecipeListScreen
        title={list.title}
        subtitle={list.subtitle}
        recipes={list.recipes}
        setup={setup}
        onHand={onHand}
        splitByFit={list.split}
        showHave={listMode === "usehave"}
        emptyText={list.empty}
        onOpen={(id) => openRecipe(id)}
        onBack={back}
        onHome={goHome}
        footer={footer}
      />
    );
  } else if (setup && screen === "detail") {
    const recipe = findRecipe(currentId);
    if (recipe) {
      content = (
        <RecipeDetail
          recipe={recipe}
          setup={setup}
          onHand={onHand}
          servings={servings}
          onServings={setServings}
          isFavorite={favorites.has(recipe.id)}
          onToggleFavorite={() => {
            const saved = !favorites.has(recipe.id);
            setFavorites((s) => toggle(s, recipe.id));
            showToast(saved ? "Saved to Favorites" : "Removed from Favorites");
          }}
          onAddToList={() => {
            setGrocery((g) => [...g.filter((e) => e.recipeId !== recipe.id), { recipeId: recipe.id, servings }]);
            showToast("Added to grocery list");
          }}
          onSomethingElse={
            fromPick
              ? () => {
                  const next = pickOne(RECIPES, setup, mealTypeForHour(new Date().getHours()), recipe.id);
                  if (next) {
                    setCurrentId(next.id);
                    setServings(setup.servings);
                    window.scrollTo(0, 0);
                  }
                }
              : undefined
          }
          onBack={back}
          onHome={goHome}
        />
      );
    }
  } else if (setup && screen === "grocery") {
    content = (
      <GroceryScreen
        entries={grocery}
        recipes={allRecipes}
        onHand={onHand}
        onRemove={(id) => setGrocery((g) => g.filter((e) => e.recipeId !== id))}
        onClear={() => setGrocery([])}
        onBack={back}
        onHome={goHome}
      />
    );
  }

  return (
    <>
      <div className="app">{content ?? <WelcomeScreen onStart={() => startSetup(null)} />}</div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
