export type WalmartAisle =
  | "Produce"
  | "Meat & Deli"
  | "Dairy & Eggs"
  | "Pantry / Canned"
  | "Frozen"
  | "Bakery"
  | "Spices & Condiments";

export interface MealIngredient {
  item: string;
  amount: string;
  walmartAisle: WalmartAisle;
  tip?: string;
}

export interface MealStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerSeconds?: number;
}

export interface MealAddon {
  item: string;
  howToUse: string;
  walmartAisle: WalmartAisle;
}

export interface Meal {
  id: string;
  title: string;
  tagline: string;
  prepMinutes: number;
  cookMinutes: number;
  category: "assembly" | "microwave" | "one_skillet" | "sheet_pan" | "comfort";
  ingredients: MealIngredient[];
  instructions: MealStep[];
  whyItWorks: string;
  rutAlternativeNote: string;
  isFavorite?: boolean;
  optionalAddons?: MealAddon[];
  sidePairings?: MealAddon[];
}

export interface RutMeal {
  id: string;
  name: string;
  category?: string;
  dateAdded: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  aisle: WalmartAisle;
  mealTitle: string;
  completed: boolean;
}

export interface PantryItem {
  name: string;
  quantity: number;
}

