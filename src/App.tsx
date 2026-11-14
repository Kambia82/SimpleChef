import React, { useState, useEffect } from "react";
import { Meal, RutMeal, GroceryItem, WalmartAisle } from "./types";
import { DEFAULT_MEALS } from "./data/defaultMeals";
import { MealCard } from "./components/MealCard";
import { CookingFocusMode } from "./components/CookingFocusMode";
import { RutManagerModal } from "./components/RutManagerModal";
import { IngredientRescueModal } from "./components/IngredientRescueModal";
import { GroceryListModal } from "./components/GroceryListModal";
import { MealGeneratorBar } from "./components/MealGeneratorBar";
import {
  Sparkles,
  ChefHat,
  Shuffle,
  ShieldCheck,
  Heart,
  CheckCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  X
} from "lucide-react";

export default function App() {
  // Persistence state
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_list");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MEALS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_favorites");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ["black-bean-salsa-bowl"];
  });

  const [rutMeals, setRutMeals] = useState<RutMeal[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_ruts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "rut-1", name: "Chips and salsa", dateAdded: new Date().toISOString() },
      { id: "rut-2", name: "Boxed mac & cheese", dateAdded: new Date().toISOString() },
      { id: "rut-3", name: "Instant ramen", dateAdded: new Date().toISOString() }
    ];
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_grocery");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // UI state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [cookingMeal, setCookingMeal] = useState<Meal | null>(null);
  const [showRutModal, setShowRutModal] = useState<boolean>(false);
  const [showRescueModal, setShowRescueModal] = useState<boolean>(false);
  const [showGroceryModal, setShowGroceryModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("easy_meals_list", JSON.stringify(meals));
    } catch {}
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem("easy_meals_favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("easy_meals_ruts", JSON.stringify(rutMeals));
    } catch {}
  }, [rutMeals]);

  useEffect(() => {
    try {
      localStorage.setItem("easy_meals_grocery", JSON.stringify(groceryItems));
    } catch {}
  }, [groceryItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add ingredients from a meal to grocery list
  const handleAddToGrocery = (meal: Meal) => {
    const newItems: GroceryItem[] = meal.ingredients.map((ing) => ({
      id: `grocery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ing.item,
      amount: ing.amount,
      aisle: ing.walmartAisle,
      mealTitle: meal.title,
      completed: false
    }));

    setGroceryItems((prev) => [...prev, ...newItems]);
    showToast(`Added ${newItems.length} items for "${meal.title}" to your Walmart list!`);
  };

  const handleToggleGroceryItem = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemoveGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCompletedGrocery = () => {
    setGroceryItems((prev) => prev.filter((item) => !item.completed));
    showToast("Cleared completed items.");
  };

  const handleClearAllGrocery = () => {
    setGroceryItems([]);
    showToast("Cleared entire shopping list.");
  };

  const handleAddCustomGroceryItem = (name: string, aisle: WalmartAisle) => {
    const item: GroceryItem = {
      id: `grocery-custom-${Date.now()}`,
      name,
      amount: "1",
      aisle,
      mealTitle: "Custom Item",
      completed: false
    };
    setGroceryItems((prev) => [...prev, item]);
    showToast(`Added "${name}" to ${aisle}.`);
  };

  const handleToggleFavorite = (mealId: string) => {
    setFavorites((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]
    );
  };

  const handleAddRutMeal = (name: string) => {
    const newRut: RutMeal = {
      id: `rut-${Date.now()}`,
      name,
      dateAdded: new Date().toISOString()
    };
    setRutMeals((prev) => [...prev, newRut]);
    showToast(`Added "${name}" to avoided rut list.`);
  };

  const handleRemoveRutMeal = (id: string) => {
    setRutMeals((prev) => prev.filter((r) => r.id !== id));
  };

  // AI Meal Generator
  const handleGenerateMeal = async (energyFilter: string) => {
    setIsGenerating(true);
    try {
      const rutNames = rutMeals.map((r) => r.name);
      const res = await fetch("/api/generate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rutMeals: rutNames,
          energyLevel: energyFilter,
          timeLimit: 12
        })
      });

      if (!res.ok) {
        throw new Error("Server could not generate AI meal");
      }

      const data = await res.json();
      if (data.meal && data.meal.title) {
        const newMeal: Meal = {
          ...data.meal,
          id: `ai-meal-${Date.now()}`,
          category:
            energyFilter === "microwave"
              ? "microwave"
              : energyFilter === "one_skillet"
              ? "one_skillet"
              : "assembly"
        };
        setMeals((prev) => [newMeal, ...prev]);
        setSpotlightIndex(0);
        showToast(`Created fresh idea: "${newMeal.title}"!`);
      }
    } catch {
      // Fallback: pick a default meal that is not in rut
      const freshOptions = DEFAULT_MEALS.filter(
        (m) => !rutMeals.some((r) => m.title.toLowerCase().includes(r.name.toLowerCase()))
      );
      const randomMeal = freshOptions[Math.floor(Math.random() * freshOptions.length)] || DEFAULT_MEALS[0];
      const cloned = {
        ...randomMeal,
        id: `fresh-pick-${Date.now()}`,
        title: `${randomMeal.title} (Fresh Pick)`
      };
      setMeals((prev) => [cloned, ...prev]);
      setSpotlightIndex(0);
      showToast(`Selected easy meal: "${cloned.title}"!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Turn random ingredients into meal
  const handleRescueIngredients = async (ingredients: string[]) => {
    setIsGenerating(true);
    try {
      const rutNames = rutMeals.map((r) => r.name);
      const res = await fetch("/api/ingredients-to-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          rutMeals: rutNames
        })
      });

      if (!res.ok) throw new Error("Could not process ingredients");
      const data = await res.json();

      if (data.meal && data.meal.title) {
        const newMeal: Meal = {
          ...data.meal,
          id: `rescue-${Date.now()}`,
          category: "one_skillet"
        };
        setMeals((prev) => [newMeal, ...prev]);
        setShowRescueModal(false);
        setCookingMeal(newMeal);
        showToast(`Ingredients rescued! Starting: "${newMeal.title}"`);
      }
    } catch {
      // Fallback rescue meal
      const fallbackRescue: Meal = {
        id: `rescue-fallback-${Date.now()}`,
        title: `Quick ${ingredients.slice(0, 2).join(" & ")} Skillet`,
        tagline: "Throw your selected ingredients together in a pan for 6 minutes.",
        prepMinutes: 2,
        cookMinutes: 6,
        category: "one_skillet",
        ingredients: ingredients.map((item) => ({
          item,
          amount: "1 portion",
          walmartAisle: "Pantry / Canned"
        })),
        instructions: [
          {
            stepNumber: 1,
            title: "Heat Skillet & Add Ingredients",
            instruction: `Warm a medium non-stick skillet over medium heat with 1 tablespoon of oil. Dump in ${ingredients.join(" and ")}.`,
            timerSeconds: 0
          },
          {
            stepNumber: 2,
            title: "Warm & Season",
            instruction: "Stir for 5 minutes until steaming and heated through. Add a pinch of salt and pepper.",
            timerSeconds: 300
          },
          {
            stepNumber: 3,
            title: "Plate & Eat",
            instruction: "Scoop directly into a bowl. Zero wasted groceries!",
            timerSeconds: 0
          }
        ],
        whyItWorks: "Uses up what is in your fridge before it expires without complicated recipes.",
        rutAlternativeNote: "Stops the guilt of buying ingredients and letting them rot."
      };
      setMeals((prev) => [fallbackRescue, ...prev]);
      setShowRescueModal(false);
      setCookingMeal(fallbackRescue);
      showToast(`Created quick meal from your ingredients!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered meals
  const filteredMeals = meals.filter((meal) => {
    if (activeFilter === "favorites") {
      return favorites.includes(meal.id);
    }
    if (activeFilter === "microwave") {
      return meal.category === "microwave" || meal.category === "assembly";
    }
    if (activeFilter === "one_skillet") {
      return meal.category === "one_skillet" || meal.category === "sheet_pan";
    }
    if (activeFilter === "healthy_boost") {
      return meal.ingredients.some(
        (i) => i.walmartAisle === "Produce" || i.walmartAisle === "Frozen"
      );
    }
    return true;
  });

  const spotlightMeal = meals[spotlightIndex % meals.length] || meals[0];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-800 text-emerald-100 rounded-xl flex items-center justify-center font-bold shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-none">
                Easy Low-Effort Meals
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Low working memory • 3-5 ingredients • No Walmart ruts
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRutModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Rut Tracker</span>
              <span className="bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded text-[10px]">
                {rutMeals.length}
              </span>
            </button>

            <button
              onClick={() => setShowGroceryModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="hidden sm:inline">Walmart List</span>
              <span className="sm:hidden">List</span>
              {groceryItems.length > 0 && (
                <span className="bg-emerald-900 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {groceryItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        
        {/* Working Memory Empathy & Mindset Banner */}
        <div className="bg-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-800/80 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Cognitive-Load Promise</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-50">
              Stop surviving on chips and salsa.
            </h2>
            <p className="text-emerald-200/90 text-xs sm:text-sm leading-relaxed">
              Every meal here has <strong>max 3 to 5 ingredients</strong>, cooks in under 15 minutes, and features <strong>single-card step instructions</strong> with the ingredient amounts printed right inside the step. No flipping back and forth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowRescueModal(true)}
              className="bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ChefHat className="w-4 h-4 text-emerald-800" />
              <span>Rescue Fridge Groceries</span>
            </button>
          </div>
        </div>

        {/* Brain-Free Generator & Filter Bar */}
        <MealGeneratorBar
          onGenerateMeal={handleGenerateMeal}
          isGenerating={isGenerating}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          rutCount={rutMeals.length}
          groceryCount={groceryItems.length}
          onOpenRutModal={() => setShowRutModal(true)}
          onOpenGroceryModal={() => setShowGroceryModal(true)}
          onOpenRescueModal={() => setShowRescueModal(true)}
        />

        {/* Quick Spotlight "What Should I Eat Right Now?" Card */}
        {spotlightMeal && (
          <div className="bg-white border-2 border-emerald-700/30 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-br-lg">
              Today's Recommended Rut-Buster
            </div>

            <div className="space-y-2 max-w-2xl pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{spotlightMeal.prepMinutes + spotlightMeal.cookMinutes} minutes total</span>
                <span>•</span>
                <span>{spotlightMeal.ingredients.length} items from Walmart</span>
              </div>

              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                {spotlightMeal.title}
              </h3>
              <p className="text-sm text-stone-600">
                {spotlightMeal.tagline}
              </p>

              <div className="text-xs text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                <span className="font-bold">Why eat this:</span>
                <span>{spotlightMeal.whyItWorks}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => setCookingMeal(spotlightMeal)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Cook This (Step-by-Step)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSpotlightIndex((prev) => prev + 1)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs px-3.5 py-3 rounded-xl border border-stone-200 flex items-center justify-center gap-1.5 transition-colors"
                title="Shuffle recommendation"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle Pick</span>
              </button>
            </div>
          </div>
        )}

        {/* Meals Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">
                {activeFilter === "favorites"
                  ? "Saved Favorites"
                  : activeFilter === "microwave"
                  ? "Microwave & No-Cook Meals"
                  : activeFilter === "one_skillet"
                  ? "One-Skillet & Sheet-Pan Meals"
                  : activeFilter === "healthy_boost"
                  ? "Veggie-Boosted Easy Meals"
                  : "All Low-Cognitive-Load Meals"}
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                ({filteredMeals.length})
              </span>
            </div>

            {favorites.length > 0 && (
              <button
                onClick={() => setActiveFilter(activeFilter === "favorites" ? "all" : "favorites")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  activeFilter === "favorites"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${activeFilter === "favorites" ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>Favorites ({favorites.length})</span>
              </button>
            )}
          </div>

          {filteredMeals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-stone-800">No meals found in this filter</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try clicking "All Easy Meals" or tap "Generate Fresh Idea" to let the assistant create a new one!
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-xs font-semibold bg-emerald-700 text-white px-4 py-2 rounded-xl"
              >
                Show All Meals
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onCook={(m) => setCookingMeal(m)}
                  onAddToGrocery={handleAddToGrocery}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(meal.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p>
            Crafted for low working memory, executive exhaustion, and healthy Walmart shopping.
          </p>
          <p className="text-stone-400">
            No complex chopping • Single-step focus mode • Aisle-organized lists
          </p>
        </div>
      </footer>

      {/* Full-Screen Step-by-Step Focus Mode */}
      {cookingMeal && (
        <CookingFocusMode
          meal={cookingMeal}
          onClose={() => setCookingMeal(null)}
          onAddToGrocery={handleAddToGrocery}
        />
      )}

      {/* Rut Manager Modal */}
      {showRutModal && (
        <RutManagerModal
          rutMeals={rutMeals}
          onAddRutMeal={handleAddRutMeal}
          onRemoveRutMeal={handleRemoveRutMeal}
          onClose={() => setShowRutModal(false)}
          onRequestSwap={(rutName) => {
            handleGenerateMeal(`healthy swap for ${rutName}`);
          }}
        />
      )}

      {/* Grocery List Modal */}
      {showGroceryModal && (
        <GroceryListModal
          items={groceryItems}
          onToggleItem={handleToggleGroceryItem}
          onRemoveItem={handleRemoveGroceryItem}
          onClearCompleted={handleClearCompletedGrocery}
          onClearAll={handleClearAllGrocery}
          onAddItem={handleAddCustomGroceryItem}
          onClose={() => setShowGroceryModal(false)}
        />
      )}

      {/* Ingredient Rescue Modal */}
      {showRescueModal && (
        <IngredientRescueModal
          onRescue={handleRescueIngredients}
          onClose={() => setShowRescueModal(false)}
          isLoading={isGenerating}
        />
      )}
    </div>
  );
}
