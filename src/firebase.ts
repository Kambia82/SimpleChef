import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import {
  CookingEffort,
  CookingEquipment,
  DietaryRestriction,
  GroceryItem,
  Meal,
  PantryItem,
  RutMeal,
  WalmartAisle
} from "./types";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerIds?: string[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  // Never emit raw user emails or sensitive PII in client/console diagnostics
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerIds:
        auth.currentUser?.providerData?.map((provider) => provider.providerId).filter(Boolean) || []
    },
    operationType,
    path
  };
  console.error("Firestore operation failed:", operationType, path);
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testFirestoreConnection();

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}

const VALID_AISLES = new Set<WalmartAisle>([
  "Produce",
  "Meat & Deli",
  "Dairy & Eggs",
  "Pantry / Canned",
  "Frozen",
  "Bakery",
  "Spices & Condiments"
]);

const VALID_CATEGORIES = new Set<Meal["category"]>([
  "assembly",
  "microwave",
  "one_skillet",
  "sheet_pan",
  "comfort"
]);

const VALID_EFFORTS = new Set<CookingEffort>(["very_low", "low", "moderate", "normal"]);
const VALID_EQUIPMENT = new Set<CookingEquipment>([
  "stove",
  "oven",
  "microwave",
  "toaster",
  "air_fryer",
  "fridge",
  "freezer"
]);
const VALID_DIETARY = new Set<DietaryRestriction>([
  "vegetarian",
  "gluten_free",
  "dairy_free",
  "high_protein"
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAisle(raw: unknown): WalmartAisle | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, 40);
  if (!trimmed) return null;
  if (VALID_AISLES.has(trimmed as WalmartAisle)) {
    return trimmed as WalmartAisle;
  }
  return "Pantry / Canned";
}

// Strict per-item validation & sanitization aligned with firebase-blueprint.json & firestore.rules.
// Validates EVERY element before writes and skips malformed entries on reads without crashing.
export function sanitizePantryForCloud(items: unknown): PantryItem[] {
  if (!Array.isArray(items)) return [];
  const deduped = new Map<string, PantryItem>();

  for (const entry of items) {
    if (!isPlainObject(entry)) continue;
    if (typeof entry.name !== "string") continue;
    if (typeof entry.quantity !== "number" || !Number.isFinite(entry.quantity)) continue;

    const name = entry.name.trim().slice(0, 100);
    const quantity = Math.round(entry.quantity);
    if (!name || quantity < 1) continue;

    const clampedQty = Math.min(999, quantity);
    const key = name.toLowerCase();
    const existing = deduped.get(key);
    if (existing) {
      existing.quantity = Math.min(999, existing.quantity + clampedQty);
    } else if (deduped.size < 150) {
      deduped.set(key, { name, quantity: clampedQty });
    }
  }

  return Array.from(deduped.values());
}

export function sanitizeGroceryForCloud(items: unknown): GroceryItem[] {
  if (!Array.isArray(items)) return [];
  const result: GroceryItem[] = [];
  const seenIds = new Set<string>();

  for (const entry of items) {
    if (result.length >= 200) break;
    if (!isPlainObject(entry)) continue;
    if (
      typeof entry.id !== "string" ||
      typeof entry.name !== "string" ||
      typeof entry.amount !== "string" ||
      typeof entry.mealTitle !== "string" ||
      typeof entry.completed !== "boolean"
    ) {
      continue;
    }

    const aisle = normalizeAisle(entry.aisle);
    if (!aisle) continue;

    const id = entry.id.trim().slice(0, 128);
    const name = entry.name.trim().slice(0, 120);
    if (!id || !name || seenIds.has(id)) continue;

    seenIds.add(id);
    result.push({
      id,
      name,
      amount: entry.amount.trim().slice(0, 60),
      aisle,
      mealTitle: entry.mealTitle.trim().slice(0, 120),
      completed: entry.completed
    });
  }

  return result;
}

export function sanitizeRutForCloud(items: unknown): RutMeal[] {
  if (!Array.isArray(items)) return [];
  const result: RutMeal[] = [];
  const seenIds = new Set<string>();

  for (const entry of items) {
    if (result.length >= 100) break;
    if (!isPlainObject(entry)) continue;
    if (
      typeof entry.id !== "string" ||
      typeof entry.name !== "string" ||
      typeof entry.dateAdded !== "string"
    ) {
      continue;
    }
    if (entry.category !== undefined && typeof entry.category !== "string") {
      continue;
    }

    const id = entry.id.trim().slice(0, 128);
    const name = entry.name.trim().slice(0, 100);
    const dateAdded = entry.dateAdded.trim().slice(0, 64);
    if (!id || !name || !dateAdded || seenIds.has(id)) continue;

    seenIds.add(id);
    const cleaned: RutMeal = { id, name, dateAdded };
    if (typeof entry.category === "string" && entry.category.trim()) {
      cleaned.category = entry.category.trim().slice(0, 60);
    }
    result.push(cleaned);
  }

  return result;
}

export function sanitizeFavoritesForCloud(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  const result: string[] = [];
  const seen = new Set<string>();

  for (const entry of items) {
    if (result.length >= 200) break;
    if (typeof entry !== "string") continue;
    const id = entry.trim().slice(0, 128);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  return result;
}

function sanitizeAddonList(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  const list = [];
  for (const entry of raw) {
    if (list.length >= 6) break;
    if (!isPlainObject(entry)) continue;
    if (typeof entry.item !== "string" || typeof entry.howToUse !== "string") continue;
    const aisle = normalizeAisle(entry.walmartAisle);
    if (!aisle) continue;
    const item = entry.item.trim().slice(0, 120);
    const howToUse = entry.howToUse.trim().slice(0, 240);
    if (!item || !howToUse) continue;
    list.push({ item, howToUse, walmartAisle: aisle });
  }
  return list.length > 0 ? list : undefined;
}

function sanitizeStringList(raw: unknown, maxItems = 16, maxLen = 120): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const cleaned = raw
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
  return cleaned.length > 0 ? cleaned : undefined;
}

export function sanitizeCustomMealsForCloud(items: unknown): Meal[] {
  if (!Array.isArray(items)) return [];
  const result: Meal[] = [];
  const seenIds = new Set<string>();

  for (const entry of items) {
    if (result.length >= 100) break;
    if (!isPlainObject(entry)) continue;
    if (
      typeof entry.id !== "string" ||
      typeof entry.title !== "string" ||
      typeof entry.tagline !== "string" ||
      typeof entry.prepMinutes !== "number" ||
      !Number.isFinite(entry.prepMinutes) ||
      typeof entry.cookMinutes !== "number" ||
      !Number.isFinite(entry.cookMinutes) ||
      typeof entry.category !== "string" ||
      !Array.isArray(entry.ingredients) ||
      !Array.isArray(entry.instructions) ||
      typeof entry.whyItWorks !== "string" ||
      typeof entry.rutAlternativeNote !== "string"
    ) {
      continue;
    }

    const id = entry.id.trim().slice(0, 128);
    const title = entry.title.trim().slice(0, 120);
    if (!id || !title || seenIds.has(id)) continue;

    const ingredients: Meal["ingredients"] = [];
    for (const ing of entry.ingredients) {
      if (ingredients.length >= 16) break;
      if (!isPlainObject(ing)) continue;
      if (typeof ing.item !== "string" || typeof ing.amount !== "string") continue;
      if (ing.tip !== undefined && typeof ing.tip !== "string") continue;
      const walmartAisle = normalizeAisle(ing.walmartAisle);
      if (!walmartAisle) continue;
      const item = ing.item.trim().slice(0, 120);
      const amount = ing.amount.trim().slice(0, 60);
      if (!item || !amount) continue;
      ingredients.push({
        item,
        amount,
        walmartAisle,
        ...(typeof ing.tip === "string" && ing.tip.trim()
          ? { tip: ing.tip.trim().slice(0, 140) }
          : {}),
        ...(ing.optional === true ? { optional: true } : {})
      });
    }

    const instructions: Meal["instructions"] = [];
    for (const step of entry.instructions) {
      if (instructions.length >= 10) break;
      if (!isPlainObject(step)) continue;
      if (
        typeof step.stepNumber !== "number" ||
        !Number.isFinite(step.stepNumber) ||
        typeof step.title !== "string" ||
        typeof step.instruction !== "string"
      ) {
        continue;
      }
      if (
        step.timerSeconds !== undefined &&
        (typeof step.timerSeconds !== "number" || !Number.isFinite(step.timerSeconds))
      ) {
        continue;
      }
      const stepTitle = step.title.trim().slice(0, 120);
      const instruction = step.instruction.trim().slice(0, 500);
      if (!stepTitle || !instruction) continue;
      instructions.push({
        stepNumber: Math.max(1, Math.round(step.stepNumber)),
        title: stepTitle,
        instruction,
        ...(typeof step.timerSeconds === "number" && step.timerSeconds > 0
          ? { timerSeconds: Math.min(3600, Math.round(step.timerSeconds)) }
          : {})
      });
    }

    if (ingredients.length === 0 || instructions.length === 0) continue;

    const category: Meal["category"] = VALID_CATEGORIES.has(entry.category as Meal["category"])
      ? (entry.category as Meal["category"])
      : "one_skillet";

    const effortLevel =
      typeof entry.effortLevel === "string" && VALID_EFFORTS.has(entry.effortLevel as CookingEffort)
        ? (entry.effortLevel as CookingEffort)
        : undefined;

    const requiredEquipment = Array.isArray(entry.requiredEquipment)
      ? entry.requiredEquipment.filter(
          (e): e is CookingEquipment =>
            typeof e === "string" && VALID_EQUIPMENT.has(e as CookingEquipment)
        )
      : undefined;

    const dietaryTags = Array.isArray(entry.dietaryTags)
      ? entry.dietaryTags.filter(
          (d): d is DietaryRestriction =>
            typeof d === "string" && VALID_DIETARY.has(d as DietaryRestriction)
        )
      : undefined;

    const mealType =
      typeof entry.mealType === "string" &&
      ["breakfast", "lunch", "dinner", "snack"].includes(entry.mealType)
        ? (entry.mealType as Meal["mealType"])
        : undefined;

    const optionalAddons = sanitizeAddonList(entry.optionalAddons);
    const sidePairings = sanitizeAddonList(entry.sidePairings);
    const ownedIngredients = sanitizeStringList(entry.ownedIngredients);
    const missingIngredients = sanitizeStringList(entry.missingIngredients);
    const optionalIngredients = sanitizeStringList(entry.optionalIngredients);
    const possibleSubstitutions = sanitizeStringList(entry.possibleSubstitutions, 8, 160);

    seenIds.add(id);
    result.push({
      id,
      title,
      tagline: entry.tagline.trim().slice(0, 300),
      prepMinutes: Math.max(0, Math.min(180, Math.round(entry.prepMinutes))),
      cookMinutes: Math.max(0, Math.min(180, Math.round(entry.cookMinutes))),
      category,
      ingredients,
      instructions,
      whyItWorks: entry.whyItWorks.trim().slice(0, 400),
      rutAlternativeNote: entry.rutAlternativeNote.trim().slice(0, 400),
      ...(effortLevel ? { effortLevel } : {}),
      ...(requiredEquipment && requiredEquipment.length > 0 ? { requiredEquipment } : {}),
      ...(typeof entry.requiresFreezer === "boolean" ? { requiresFreezer: entry.requiresFreezer } : {}),
      ...(mealType ? { mealType } : {}),
      ...(dietaryTags && dietaryTags.length > 0 ? { dietaryTags } : {}),
      ...(typeof entry.comfortVariationOf === "string" && entry.comfortVariationOf.trim()
        ? { comfortVariationOf: entry.comfortVariationOf.trim().slice(0, 100) }
        : {}),
      ...(ownedIngredients ? { ownedIngredients } : {}),
      ...(missingIngredients ? { missingIngredients } : {}),
      ...(optionalIngredients ? { optionalIngredients } : {}),
      ...(possibleSubstitutions ? { possibleSubstitutions } : {}),
      ...(optionalAddons ? { optionalAddons } : {}),
      ...(sidePairings ? { sidePairings } : {})
    });
  }

  return result;
}

export function generateHouseholdCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}
