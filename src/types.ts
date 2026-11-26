export type WalmartAisle =
  | "Produce"
  | "Meat & Deli"
  | "Dairy & Eggs"
  | "Pantry / Canned"
  | "Frozen"
  | "Bakery"
  | "Spices & Condiments";

export type CookingEnvironment =
  | "full_kitchen"
  | "microwave_only"
  | "microwave_mini_fridge"
  | "limited_kitchen"
  | "custom";

export type CookingEquipment =
  | "stove"
  | "oven"
  | "microwave"
  | "toaster"
  | "air_fryer"
  | "fridge"
  | "freezer"
  | "other";

export type LivingSituation = "standard" | "dorm";

export type SharedKitchenPreference = "none" | "available_avoid" | "available_use";

export interface DormConstraints {
  limitedFridgeSpace: boolean;
  limitedFreezerSpace: boolean;
  limitedFoodStorage: boolean;
  limitedCounterSpace: boolean;
  sharedAppliances: boolean;
  minimalCookware: boolean;
  preferShelfStable: boolean;
  smallerQuantities: boolean;
}

export type IngredientStorage = "shelf_stable" | "fridge" | "freezer";

export type CookingEffort = "very_low" | "low" | "moderate" | "normal";

export type VarietyPreference = "familiar" | "balanced" | "new_ideas";

export type MealType = "any" | "breakfast" | "lunch" | "dinner" | "snack";

export type DietaryRestriction =
  | "vegetarian"
  | "gluten_free"
  | "dairy_free"
  | "high_protein";

export interface KitchenProfile {
  environment: CookingEnvironment;
  equipment: CookingEquipment[];
  hasFreezer: boolean;
  effort: CookingEffort;
  varietyPreference: VarietyPreference;
  dietaryRestrictions: DietaryRestriction[];
  livingSituation?: LivingSituation;
  dormConstraints?: DormConstraints;
  sharedKitchen?: SharedKitchenPreference;
  otherEquipmentLabel?: string;
}

export interface MealIngredient {
  item: string;
  amount: string;
  walmartAisle: WalmartAisle;
  tip?: string;
  optional?: boolean;
  storage?: IngredientStorage;
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
  effortLevel?: CookingEffort;
  requiredEquipment?: CookingEquipment[];
  requiresFreezer?: boolean;
  mealType?: Exclude<MealType, "any">;
  dietaryTags?: DietaryRestriction[];
  comfortVariationOf?: string;
  ownedIngredients?: string[];
  missingIngredients?: string[];
  optionalIngredients?: string[];
  possibleSubstitutions?: string[];
  ingredients: MealIngredient[];
  instructions: MealStep[];
  whyItWorks: string;
  rutAlternativeNote: string;
  /** Short formula to remember the meal, e.g. "Bagel + egg + cheese". */
  rememberAs?: string;
  /** An even easier way to make it. */
  lazyVersion?: string;
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

export type KitchenMode = "microwave_only" | "full_kitchen";
