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
import { GroceryItem, Meal, PantryItem, RutMeal } from "./types";

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
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
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

// Payload sanitization aligned strictly with firebase-blueprint.json & firestore.rules
export function sanitizePantryForCloud(items: PantryItem[]): PantryItem[] {
  return items
    .map((item) => ({
      name: String(item.name || "").trim().slice(0, 100),
      quantity: Math.max(1, Math.min(999, Math.round(Number(item.quantity) || 1)))
    }))
    .filter((item) => item.name.length > 0)
    .slice(0, 150);
}

export function sanitizeGroceryForCloud(items: GroceryItem[]): GroceryItem[] {
  return items
    .map((item) => ({
      id: String(item.id || `g-${Date.now()}`).slice(0, 128),
      name: String(item.name || "").trim().slice(0, 120),
      amount: String(item.amount || "1").slice(0, 60),
      aisle: item.aisle,
      mealTitle: String(item.mealTitle || "Easy Meal").slice(0, 120),
      completed: Boolean(item.completed)
    }))
    .filter((item) => item.id.length > 0 && item.name.length > 0)
    .slice(0, 200);
}

export function sanitizeRutForCloud(items: RutMeal[]): RutMeal[] {
  return items
    .map((item) => {
      const cleaned: RutMeal = {
        id: String(item.id || `rut-${Date.now()}`).slice(0, 128),
        name: String(item.name || "").trim().slice(0, 100),
        dateAdded: String(item.dateAdded || new Date().toISOString()).slice(0, 64)
      };
      if (item.category) {
        cleaned.category = String(item.category).slice(0, 60);
      }
      return cleaned;
    })
    .filter((item) => item.id.length > 0 && item.name.length > 0)
    .slice(0, 100);
}

export function sanitizeFavoritesForCloud(items: string[]): string[] {
  return items
    .map((id) => String(id || "").trim().slice(0, 128))
    .filter((id) => id.length > 0)
    .slice(0, 200);
}

export function sanitizeCustomMealsForCloud(items: Meal[]): Meal[] {
  return items
    .map((m) => ({
      ...m,
      id: String(m.id || `meal-${Date.now()}`).slice(0, 128),
      title: String(m.title || "Easy Meal").trim().slice(0, 120)
    }))
    .filter((m) => m.id.length > 0 && m.title.length > 0)
    .slice(0, 100);
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
