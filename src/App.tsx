import React, { useState, useEffect, useRef } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { Meal, MealAddon, RutMeal, GroceryItem, WalmartAisle, PantryItem } from "./types";
import { DEFAULT_MEALS } from "./data/defaultMeals";
import { MealCard } from "./components/MealCard";
import { CookingFocusMode } from "./components/CookingFocusMode";
import { RutManagerModal } from "./components/RutManagerModal";
import { IngredientRescueModal } from "./components/IngredientRescueModal";
import { GroceryListModal } from "./components/GroceryListModal";
import { MealGeneratorBar } from "./components/MealGeneratorBar";
import { PantryModal } from "./components/PantryModal";
import { AccountSyncModal } from "./components/AccountSyncModal";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { OfflineIndicator } from "./components/OfflineIndicator";
import {
  getMissingIngredients,
  getPantryMatchStats,
  normalizePantryList
} from "./utils/pantryMatch";
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  signInWithGoogle,
  signOutUser,
  sanitizePantryForCloud,
  sanitizeGroceryForCloud,
  sanitizeRutForCloud,
  sanitizeFavoritesForCloud,
  sanitizeCustomMealsForCloud,
  generateHouseholdCode
} from "./firebase";
import {
  Sparkles,
  ChefHat,
  Shuffle,
  ShieldCheck,
  Heart,
  CheckCircle,
  Clock,
  ArrowRight,
  PackageCheck,
  Loader2,
  Cloud,
  Users,
  ShoppingCart,
  ShoppingBag
} from "lucide-react";

const DEFAULT_RUTS: RutMeal[] = [
  { id: "rut-1", name: "Chips and salsa", dateAdded: new Date().toISOString() },
  { id: "rut-2", name: "Boxed mac & cheese", dateAdded: new Date().toISOString() },
  { id: "rut-3", name: "Instant ramen", dateAdded: new Date().toISOString() }
];

const DEFAULT_ID_SET = new Set(DEFAULT_MEALS.map((m) => m.id));

function mergeMealsWithDefaults(customMeals: Meal[]): Meal[] {
  const uniqueCustom = customMeals.filter((m) => !DEFAULT_ID_SET.has(m.id));
  return [...uniqueCustom, ...DEFAULT_MEALS];
}

export default function App() {
  // Persistence state: keep custom/AI meals and merge latest curated default meals
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_list");
      if (saved) {
        const parsed: Meal[] = JSON.parse(saved);
        return mergeMealsWithDefaults(parsed);
      }
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
    return DEFAULT_RUTS;
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_grocery");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_pantry");
      if (saved) return normalizePantryList(JSON.parse(saved));
    } catch {}
    return [];
  });

  // Firebase Auth & Sync state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [householdId, setHouseholdId] = useState<string>("");
  const [householdName, setHouseholdName] = useState<string>("");
  const [isPrivateCloudReady, setIsPrivateCloudReady] = useState<boolean>(false);
  const [isSharedCloudReady, setIsSharedCloudReady] = useState<boolean>(false);
  const [isSyncingAction, setIsSyncingAction] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // UI state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [cookingMeal, setCookingMeal] = useState<Meal | null>(null);
  const [showRutModal, setShowRutModal] = useState<boolean>(false);
  const [showRescueModal, setShowRescueModal] = useState<boolean>(false);
  const [showGroceryModal, setShowGroceryModal] = useState<boolean>(false);
  const [showPantryModal, setShowPantryModal] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [generatingMode, setGeneratingMode] = useState<"single" | "batch" | null>(null);
  const [isRescuing, setIsRescuing] = useState<boolean>(false);
  const [isSuggestingFromPantry, setIsSuggestingFromPantry] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  const toastTimerRef = useRef<number | null>(null);
  const rescueAbortRef = useRef<AbortController | null>(null);
  const rescueCancelledByUserRef = useRef<boolean>(false);
  const pantryAbortRef = useRef<AbortController | null>(null);
  const lastSuggestedPantrySigRef = useRef<string>("");

  // Track last synced cloud payloads to prevent echo loops
  const lastPrivateSnapshotRef = useRef<{
    pantry: string;
    grocery: string;
    rut: string;
    favorites: string;
    customMeals: string;
    householdId: string;
  }>({
    pantry: "",
    grocery: "",
    rut: "",
    favorites: "",
    customMeals: "",
    householdId: ""
  });

  const lastSharedSnapshotRef = useRef<{
    pantry: string;
    grocery: string;
  }>({
    pantry: "",
    grocery: ""
  });

  // Save changes to localStorage as fast offline cache
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

  useEffect(() => {
    try {
      localStorage.setItem("easy_meals_pantry", JSON.stringify(pantryItems));
    } catch {}
  }, [pantryItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setHouseholdId("");
        setHouseholdName("");
        setIsPrivateCloudReady(false);
        setIsSharedCloudReady(false);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to private user state in Firestore
  useEffect(() => {
    if (!authReady || !user) return;

    const userStatePath = `users/${user.uid}/appState/main`;
    const userStateRef = doc(db, "users", user.uid, "appState", "main");
    let active = true;

    const unsub = onSnapshot(
      userStateRef,
      async (snapshot) => {
        if (!active) return;

        if (!snapshot.exists()) {
          const initPantry = sanitizePantryForCloud(pantryItems);
          const initGrocery = sanitizeGroceryForCloud(groceryItems);
          const initRut = sanitizeRutForCloud(rutMeals);
          const initFavs = sanitizeFavoritesForCloud(favorites);
          const initCustom = sanitizeCustomMealsForCloud(
            meals.filter((m) => !DEFAULT_ID_SET.has(m.id))
          );

          lastPrivateSnapshotRef.current = {
            pantry: JSON.stringify(initPantry),
            grocery: JSON.stringify(initGrocery),
            rut: JSON.stringify(initRut),
            favorites: JSON.stringify(initFavs),
            customMeals: JSON.stringify(initCustom),
            householdId: ""
          };

          try {
            await setDoc(userStateRef, {
              ownerId: user.uid,
              pantryItems: initPantry,
              groceryItems: initGrocery,
              rutMeals: initRut,
              favorites: initFavs,
              customMeals: initCustom,
              householdId: "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            if (active) setIsPrivateCloudReady(true);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, userStatePath);
          }
          return;
        }

        const data = snapshot.data();
        const remoteHouseholdId = typeof data.householdId === "string" ? data.householdId : "";
        const remotePantry = sanitizePantryForCloud(normalizePantryList(data.pantryItems));
        const remoteGrocery = sanitizeGroceryForCloud(Array.isArray(data.groceryItems) ? data.groceryItems : []);
        const remoteRut = sanitizeRutForCloud(Array.isArray(data.rutMeals) ? data.rutMeals : []);
        const remoteFavs = sanitizeFavoritesForCloud(Array.isArray(data.favorites) ? data.favorites : []);
        const remoteCustom = sanitizeCustomMealsForCloud(Array.isArray(data.customMeals) ? data.customMeals : []);

        lastPrivateSnapshotRef.current = {
          pantry: JSON.stringify(remotePantry),
          grocery: JSON.stringify(remoteGrocery),
          rut: JSON.stringify(remoteRut),
          favorites: JSON.stringify(remoteFavs),
          customMeals: JSON.stringify(remoteCustom),
          householdId: remoteHouseholdId
        };

        setRutMeals(remoteRut);
        setFavorites(remoteFavs);
        setMeals(mergeMealsWithDefaults(remoteCustom));
        setHouseholdId(remoteHouseholdId);

        if (!remoteHouseholdId) {
          setPantryItems(remotePantry);
          setGroceryItems(remoteGrocery);
          setIsSharedCloudReady(false);
          setHouseholdName("");
        }

        setIsPrivateCloudReady(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userStatePath);
      }
    );

    return () => {
      active = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.uid]);

  // Subscribe to optional shared household state when householdId is active
  useEffect(() => {
    if (!authReady || !user || !householdId) {
      setIsSharedCloudReady(false);
      return;
    }

    const householdMetaPath = `households/${householdId}`;
    const sharedPath = `households/${householdId}/sharedState/main`;

    const unsubMeta = onSnapshot(
      doc(db, "households", householdId),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setHouseholdName(typeof d.name === "string" ? d.name : "Shared Household");
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, householdMetaPath);
      }
    );

    const unsubShared = onSnapshot(
      doc(db, "households", householdId, "sharedState", "main"),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const remotePantry = sanitizePantryForCloud(normalizePantryList(data.pantryItems));
        const remoteGrocery = sanitizeGroceryForCloud(Array.isArray(data.groceryItems) ? data.groceryItems : []);

        lastSharedSnapshotRef.current = {
          pantry: JSON.stringify(remotePantry),
          grocery: JSON.stringify(remoteGrocery)
        };

        setPantryItems(remotePantry);
        setGroceryItems(remoteGrocery);
        setIsSharedCloudReady(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, sharedPath);
      }
    );

    return () => {
      unsubMeta();
      unsubShared();
    };
  }, [authReady, user, householdId]);

  // Sync local changes back to Firestore (only sending changed fields + updatedAt)
  useEffect(() => {
    if (!user || !isPrivateCloudReady) return;
    if (householdId && !isSharedCloudReady) return;

    const timer = setTimeout(async () => {
      const cleanPantry = sanitizePantryForCloud(pantryItems);
      const cleanGrocery = sanitizeGroceryForCloud(groceryItems);
      const cleanRut = sanitizeRutForCloud(rutMeals);
      const cleanFavs = sanitizeFavoritesForCloud(favorites);
      const cleanCustom = sanitizeCustomMealsForCloud(
        meals.filter((m) => !DEFAULT_ID_SET.has(m.id))
      );

      const pantryJson = JSON.stringify(cleanPantry);
      const groceryJson = JSON.stringify(cleanGrocery);
      const rutJson = JSON.stringify(cleanRut);
      const favsJson = JSON.stringify(cleanFavs);
      const customJson = JSON.stringify(cleanCustom);

      // 1. Update private personal fields (and pantry/grocery if not in a household)
      const privateUpdates: Record<string, unknown> = {};
      if (rutJson !== lastPrivateSnapshotRef.current.rut) {
        privateUpdates.rutMeals = cleanRut;
      }
      if (favsJson !== lastPrivateSnapshotRef.current.favorites) {
        privateUpdates.favorites = cleanFavs;
      }
      if (customJson !== lastPrivateSnapshotRef.current.customMeals) {
        privateUpdates.customMeals = cleanCustom;
      }
      if (!householdId) {
        if (pantryJson !== lastPrivateSnapshotRef.current.pantry) {
          privateUpdates.pantryItems = cleanPantry;
        }
        if (groceryJson !== lastPrivateSnapshotRef.current.grocery) {
          privateUpdates.groceryItems = cleanGrocery;
        }
      }

      const privateChangedKeys = Object.keys(privateUpdates);
      if (privateChangedKeys.length > 0) {
        const userStatePath = `users/${user.uid}/appState/main`;
        const allowedSingleOrPair =
          privateChangedKeys.length === 1 ||
          (privateChangedKeys.length === 2 &&
            privateUpdates.pantryItems !== undefined &&
            privateUpdates.groceryItems !== undefined);

        const payloadToSend = allowedSingleOrPair
          ? { ...privateUpdates, updatedAt: serverTimestamp() }
          : {
              pantryItems: householdId
                ? JSON.parse(lastPrivateSnapshotRef.current.pantry || "[]")
                : cleanPantry,
              groceryItems: householdId
                ? JSON.parse(lastPrivateSnapshotRef.current.grocery || "[]")
                : cleanGrocery,
              rutMeals: cleanRut,
              favorites: cleanFavs,
              customMeals: cleanCustom,
              householdId,
              updatedAt: serverTimestamp()
            };

        lastPrivateSnapshotRef.current = {
          ...lastPrivateSnapshotRef.current,
          rut: rutJson,
          favorites: favsJson,
          customMeals: customJson,
          ...(householdId ? {} : { pantry: pantryJson, grocery: groceryJson })
        };

        try {
          await updateDoc(doc(db, "users", user.uid, "appState", "main"), payloadToSend);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, userStatePath);
        }
      }

      // 2. Update shared household pantry/grocery when connected to a household
      if (householdId && isSharedCloudReady) {
        const sharedUpdates: Record<string, unknown> = {};
        if (pantryJson !== lastSharedSnapshotRef.current.pantry) {
          sharedUpdates.pantryItems = cleanPantry;
        }
        if (groceryJson !== lastSharedSnapshotRef.current.grocery) {
          sharedUpdates.groceryItems = cleanGrocery;
        }

        if (Object.keys(sharedUpdates).length > 0) {
          const sharedPath = `households/${householdId}/sharedState/main`;
          lastSharedSnapshotRef.current = {
            pantry: pantryJson,
            grocery: groceryJson
          };
          try {
            await updateDoc(doc(db, "households", householdId, "sharedState", "main"), {
              ...sharedUpdates,
              updatedBy: user.uid,
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, sharedPath);
          }
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    user,
    isPrivateCloudReady,
    isSharedCloudReady,
    householdId,
    pantryItems,
    groceryItems,
    rutMeals,
    favorites,
    meals
  ]);

  // Auth & Household handlers
  const handleSignIn = async () => {
    setSyncError(null);
    setIsSyncingAction(true);
    try {
      await signInWithGoogle();
      showToast("Signed in! Your pantry & Walmart list now sync privately.");
    } catch (err) {
      setSyncError(
        err instanceof Error && err.message.includes("popup-closed-by-user")
          ? "Sign-in window was closed before completing."
          : "Could not complete Google sign-in. Please try again."
      );
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleSignOut = async () => {
    setSyncError(null);
    setIsSyncingAction(true);
    try {
      await signOutUser();
      showToast("Signed out. Using local device storage.");
    } catch {
      setSyncError("Could not sign out right now.");
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleCreateHousehold = async (name: string) => {
    if (!user) return;
    setSyncError(null);
    setIsSyncingAction(true);
    const code = generateHouseholdCode();
    const displayName = (user.displayName || "Member").slice(0, 60) || "Member";

    try {
      const cleanPantry = sanitizePantryForCloud(pantryItems);
      const cleanGrocery = sanitizeGroceryForCloud(groceryItems);

      lastSharedSnapshotRef.current = {
        pantry: JSON.stringify(cleanPantry),
        grocery: JSON.stringify(cleanGrocery)
      };

      const batch = writeBatch(db);
      batch.set(doc(db, "households", code), {
        ownerId: user.uid,
        name: name.slice(0, 60) || "My Household",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      batch.set(doc(db, "households", code, "members", user.uid), {
        uid: user.uid,
        role: "owner",
        displayName,
        joinedAt: serverTimestamp()
      });
      batch.set(doc(db, "households", code, "sharedState", "main"), {
        ownerId: user.uid,
        updatedBy: user.uid,
        pantryItems: cleanPantry,
        groceryItems: cleanGrocery,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      batch.update(doc(db, "users", user.uid, "appState", "main"), {
        householdId: code,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      setHouseholdId(code);
      setHouseholdName(name);
      showToast(`Household created! Share code ${code} with your household.`);
    } catch (err) {
      setSyncError("Could not create household right now. Check your connection and try again.");
      console.error("Create household error:", err);
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleJoinHousehold = async (rawCode: string) => {
    if (!user) return;
    const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      setSyncError("Please enter a valid 6–12 character household code.");
      return;
    }

    setSyncError(null);
    setIsSyncingAction(true);
    const displayName = (user.displayName || "Member").slice(0, 60) || "Member";

    try {
      const memberRef = doc(db, "households", code, "members", user.uid);
      const existingMember = await getDoc(memberRef);

      const batch = writeBatch(db);
      if (!existingMember.exists()) {
        batch.set(memberRef, {
          uid: user.uid,
          role: "member",
          displayName,
          joinedAt: serverTimestamp()
        });
      }
      batch.update(doc(db, "users", user.uid, "appState", "main"), {
        householdId: code,
        updatedAt: serverTimestamp()
      });
      await batch.commit();
      setHouseholdId(code);
      showToast(`Joined household ${code}! Pantry & Walmart list are now shared.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
        setSyncError("Household code not found. Double-check the code and try again.");
      } else {
        setSyncError("Could not join household right now. Please try again.");
      }
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleLeaveHousehold = async () => {
    if (!user || !householdId) return;
    setSyncError(null);
    setIsSyncingAction(true);
    const currentCode = householdId;

    try {
      const cleanPantry = sanitizePantryForCloud(pantryItems);
      const cleanGrocery = sanitizeGroceryForCloud(groceryItems);

      lastPrivateSnapshotRef.current = {
        ...lastPrivateSnapshotRef.current,
        pantry: JSON.stringify(cleanPantry),
        grocery: JSON.stringify(cleanGrocery),
        householdId: ""
      };

      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid, "appState", "main"), {
        pantryItems: cleanPantry,
        groceryItems: cleanGrocery,
        householdId: "",
        updatedAt: serverTimestamp()
      });
      batch.delete(doc(db, "households", currentCode, "members", user.uid));
      await batch.commit();

      setHouseholdId("");
      setHouseholdName("");
      setIsSharedCloudReady(false);
      showToast("Left household. Your lists are back to private mode.");
    } catch (err) {
      setSyncError("Could not leave household right now. Check your connection and try again.");
      console.error("Leave household error:", err);
    } finally {
      setIsSyncingAction(false);
    }
  };

  // Add all ingredients from a meal to grocery list
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

  // Add ONLY missing ingredients (not currently in pantry) to grocery list
  const handleAddMissingToGrocery = (meal: Meal) => {
    const missing = getMissingIngredients(meal, pantryItems);
    if (missing.length === 0) {
      showToast(`You already have all ingredients for "${meal.title}" in your pantry!`);
      return;
    }

    const newItems: GroceryItem[] = missing.map((ing) => ({
      id: `grocery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ing.item,
      amount: ing.amount,
      aisle: ing.walmartAisle,
      mealTitle: meal.title,
      completed: false
    }));

    setGroceryItems((prev) => [...prev, ...newItems]);
    showToast(
      `Added ${newItems.length} missing item${newItems.length === 1 ? "" : "s"} for "${meal.title}" to your Walmart list!`
    );
  };

  const handleAddExtraToGrocery = (addon: MealAddon, mealTitle: string) => {
    const item: GroceryItem = {
      id: `grocery-extra-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: addon.item,
      amount: "1",
      aisle: addon.walmartAisle,
      mealTitle: `${mealTitle} (Add-on / Side)`,
      completed: false
    };
    setGroceryItems((prev) => [...prev, item]);
    showToast(`Added "${addon.item}" to ${addon.walmartAisle} on your Walmart list!`);
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

  const handleMoveCompletedToPantry = () => {
    const completedNames = groceryItems
      .filter((item) => item.completed)
      .map((item) => item.name.trim())
      .filter(Boolean);
    if (completedNames.length === 0) return;

    setPantryItems((prev) => {
      const updated = prev.map((p) => ({ ...p }));
      for (const name of completedNames) {
        const idx = updated.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
        if (idx >= 0) {
          updated[idx].quantity = Math.min(999, updated[idx].quantity + 1);
        } else {
          updated.push({ name, quantity: 1 });
        }
      }
      return updated;
    });
    setGroceryItems((prev) => prev.filter((item) => !item.completed));
    showToast(`Added ${completedNames.length} items to My Pantry and updating meal ideas!`);
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

  // Quantity-aware pantry handlers
  const handleTogglePantryItem = (itemName: string) => {
    const cleaned = itemName.trim();
    if (!cleaned) return;
    setPantryItems((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === cleaned.toLowerCase());
      if (exists) {
        return prev.filter((p) => p.name.toLowerCase() !== cleaned.toLowerCase());
      }
      return [...prev, { name: cleaned, quantity: 1 }];
    });
  };

  const handleAddPantryItem = (itemName: string) => {
    const cleaned = itemName.trim();
    if (!cleaned) return;
    setPantryItems((prev) => {
      const idx = prev.findIndex((p) => p.name.toLowerCase() === cleaned.toLowerCase());
      if (idx >= 0) {
        return prev.map((p, i) =>
          i === idx ? { ...p, quantity: Math.min(999, p.quantity + 1) } : p
        );
      }
      return [...prev, { name: cleaned, quantity: 1 }];
    });
  };

  const handleUpdatePantryQuantity = (itemName: string, delta: number) => {
    setPantryItems((prev) => {
      const updated: PantryItem[] = [];
      for (const p of prev) {
        if (p.name.toLowerCase() === itemName.toLowerCase()) {
          const nextQty = Math.min(999, p.quantity + delta);
          if (nextQty > 0) {
            updated.push({ ...p, quantity: nextQty });
          }
        } else {
          updated.push(p);
        }
      }
      return updated;
    });
  };

  const handleRemovePantryItem = (itemName: string) => {
    setPantryItems((prev) =>
      prev.filter((p) => p.name.toLowerCase() !== itemName.toLowerCase())
    );
  };

  const handleClearPantry = () => {
    pantryAbortRef.current?.abort();
    setPantryItems([]);
    lastSuggestedPantrySigRef.current = "";
    showToast("Cleared pantry items.");
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

  // AI Meal Generator (1 fresh idea)
  const handleGenerateMeal = async (energyFilter: string) => {
    const inferredCategory: Meal["category"] =
      energyFilter === "microwave"
        ? "microwave"
        : energyFilter === "one_skillet"
        ? "one_skillet"
        : "assembly";

    const ensureVisibleInFilter = (createdMeal: Meal) => {
      if (
        activeFilter === "favorites" ||
        activeFilter === "pantry" ||
        activeFilter === "healthy_boost" ||
        (activeFilter === "microwave" && createdMeal.category !== "microwave" && createdMeal.category !== "assembly") ||
        (activeFilter === "one_skillet" && createdMeal.category !== "one_skillet" && createdMeal.category !== "sheet_pan")
      ) {
        setActiveFilter("all");
      }
    };

    const pickLocalFallback = () => {
      const freshOptions = DEFAULT_MEALS.filter(
        (m) => !rutMeals.some((r) => m.title.toLowerCase().includes(r.name.toLowerCase()))
      );
      const randomMeal = freshOptions[Math.floor(Math.random() * freshOptions.length)] || DEFAULT_MEALS[0];
      const cloned: Meal = {
        ...randomMeal,
        id: `fresh-pick-${Date.now()}`,
        title: `${randomMeal.title} (Fresh Pick)`
      };
      setMeals((prev) => [cloned, ...prev]);
      ensureVisibleInFilter(cloned);
      setSpotlightIndex(0);
      showToast(`Selected easy meal: "${cloned.title}"!`);
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      pickLocalFallback();
      return;
    }

    setGeneratingMode("single");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 16000);
    try {
      const rutNames = rutMeals.map((r) => r.name);
      const res = await fetch("/api/generate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          rutMeals: rutNames,
          existingTitles: meals.map((m) => m.title),
          pantryItems: pantryItems.map((p) => p.name),
          energyLevel: energyFilter,
          timeLimit: 12
        })
      });

      if (!res.ok) {
        throw new Error("Server could not generate AI meal");
      }

      const data = await res.json();
      if (!data.meal || !data.meal.title) {
        throw new Error("Invalid meal payload");
      }

      const newMeal: Meal = {
        ...data.meal,
        id: `ai-meal-${Date.now()}`,
        category: inferredCategory
      };
      setMeals((prev) => [newMeal, ...prev]);
      ensureVisibleInFilter(newMeal);
      setSpotlightIndex(0);
      showToast(`Created fresh idea: "${newMeal.title}"!`);
    } catch {
      pickLocalFallback();
    } finally {
      clearTimeout(timeoutId);
      setGeneratingMode(null);
    }
  };

  // AI Batch Generator (3 diverse ideas across freezer, pantry, and fridge)
  const handleGenerateBatch = async (energyFilter: string) => {
    const inferredCategory: Meal["category"] =
      energyFilter === "microwave"
        ? "microwave"
        : energyFilter === "one_skillet"
        ? "one_skillet"
        : "one_skillet";

    const ensureBatchVisible = () => {
      if (
        activeFilter === "favorites" ||
        activeFilter === "pantry" ||
        activeFilter === "healthy_boost"
      ) {
        setActiveFilter("all");
      }
    };

    const promoteLocalBatchFallback = () => {
      const nonRut = DEFAULT_MEALS.filter(
        (m) => !rutMeals.some((r) => m.title.toLowerCase().includes(r.name.toLowerCase()))
      );
      const shuffled = [...(nonRut.length >= 3 ? nonRut : DEFAULT_MEALS)].sort(
        () => Math.random() - 0.5
      );
      const pickedIds = new Set(shuffled.slice(0, 3).map((m) => m.id));
      setMeals((prev) => {
        const promoted = prev.filter((m) => pickedIds.has(m.id));
        const rest = prev.filter((m) => !pickedIds.has(m.id));
        return [...promoted, ...rest];
      });
      ensureBatchVisible();
      setSpotlightIndex(0);
      showToast("Surfaced 3 fresh meal picks from your library!");
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      promoteLocalBatchFallback();
      return;
    }

    setGeneratingMode("batch");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    try {
      const res = await fetch("/api/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          rutMeals: rutMeals.map((r) => r.name),
          existingTitles: meals.map((m) => m.title),
          pantryItems: pantryItems.map((p) => p.name),
          energyLevel: energyFilter
        })
      });

      if (!res.ok) throw new Error("Batch generation failed");
      const data = await res.json();
      const batch: Meal[] = Array.isArray(data?.meals) ? data.meals : [];
      if (batch.length === 0) throw new Error("No batch meals returned");

      const stamped: Meal[] = batch.map((m, idx) => ({
        ...m,
        id: `ai-batch-${Date.now()}-${idx}`,
        category: m.category || inferredCategory
      }));

      setMeals((prev) => {
        const existingLower = new Set(prev.map((p) => p.title.toLowerCase()));
        const unique = stamped.filter((s) => !existingLower.has(s.title.toLowerCase()));
        return [...unique, ...prev];
      });
      ensureBatchVisible();
      setSpotlightIndex(0);
      showToast(`Added ${stamped.length} brand-new meal ideas!`);
    } catch {
      promoteLocalBatchFallback();
    } finally {
      clearTimeout(timeoutId);
      setGeneratingMode(null);
    }
  };

  const handleCancelRescue = () => {
    rescueCancelledByUserRef.current = true;
    rescueAbortRef.current?.abort();
    rescueAbortRef.current = null;
    setIsRescuing(false);
  };

  // Turn random ingredients into meal
  const handleRescueIngredients = async (ingredients: string[]) => {
    const buildFallbackRescue = (): Meal => ({
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
      whyItWorks: "Uses up what is in your fridge before it turns without complicated recipes.",
      rutAlternativeNote: "Turns ingredients you already have into a warm, satisfying meal in minutes."
    });

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineMeal = buildFallbackRescue();
      setMeals((prev) => [offlineMeal, ...prev]);
      setShowRescueModal(false);
      setCookingMeal(offlineMeal);
      showToast("Created quick meal from your ingredients!");
      return;
    }

    rescueAbortRef.current?.abort();
    const controller = new AbortController();
    rescueAbortRef.current = controller;
    rescueCancelledByUserRef.current = false;
    setIsRescuing(true);
    const timeoutId = setTimeout(() => controller.abort(), 16000);

    try {
      const rutNames = rutMeals.map((r) => r.name);
      const res = await fetch("/api/ingredients-to-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ingredients,
          rutMeals: rutNames
        })
      });

      if (!res.ok) throw new Error("Could not process ingredients");
      const data = await res.json();

      if (rescueCancelledByUserRef.current) return;

      if (!data.meal || !data.meal.title) {
        throw new Error("Incomplete meal returned");
      }

      const newMeal: Meal = {
        ...data.meal,
        id: `rescue-${Date.now()}`,
        category: "one_skillet"
      };
      setMeals((prev) => [newMeal, ...prev]);
      setShowRescueModal(false);
      setCookingMeal(newMeal);
      showToast(`Ingredients rescued! Starting: "${newMeal.title}"`);
    } catch {
      if (rescueCancelledByUserRef.current) {
        return;
      }
      const fallbackRescue = buildFallbackRescue();
      setMeals((prev) => [fallbackRescue, ...prev]);
      setShowRescueModal(false);
      setCookingMeal(fallbackRescue);
      showToast(`Created quick meal from your ingredients!`);
    } finally {
      clearTimeout(timeoutId);
      if (rescueAbortRef.current === controller) {
        rescueAbortRef.current = null;
      }
      setIsRescuing(false);
    }
  };

  // Suggest new meals from pantry items
  const fetchPantrySuggestions = async (itemsToUse: PantryItem[], silent = false) => {
    if (itemsToUse.length === 0) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      if (!silent) {
        showToast("Updated matches using your saved meal library.");
      }
      return;
    }

    pantryAbortRef.current?.abort();
    const controller = new AbortController();
    pantryAbortRef.current = controller;
    setIsSuggestingFromPantry(true);
    const timeoutId = setTimeout(() => controller.abort(), 16000);

    try {
      const res = await fetch("/api/pantry-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          pantryItems: itemsToUse.map((i) => i.name),
          existingTitles: meals.map((m) => m.title),
          rutMeals: rutMeals.map((r) => r.name)
        })
      });

      if (!res.ok) throw new Error("Failed pantry suggestions");
      const data = await res.json();
      const suggested: Meal[] = Array.isArray(data?.meals) ? data.meals : [];
      if (suggested.length > 0) {
        const stamped: Meal[] = suggested.map((m, idx) => ({
          ...m,
          id: `pantry-meal-${Date.now()}-${idx}`,
          category: m.category || "one_skillet"
        }));
        setMeals((prev) => {
          const existingTitlesLower = new Set(prev.map((p) => p.title.toLowerCase()));
          const uniqueNew = stamped.filter((s) => !existingTitlesLower.has(s.title.toLowerCase()));
          return [...uniqueNew, ...prev];
        });
        showToast(`Added ${stamped.length} new meal ideas from your pantry!`);
      } else if (!silent) {
        showToast("Updated matches using your saved meal library.");
      }
    } catch {
      if (!silent) {
        showToast("Updated matches using your saved meal library.");
      }
    } finally {
      clearTimeout(timeoutId);
      if (pantryAbortRef.current === controller) {
        pantryAbortRef.current = null;
      }
      setIsSuggestingFromPantry(false);
    }
  };

  // Auto-suggest new meals whenever the user adds distinct pantry items (2+ items)
  useEffect(() => {
    if (pantryItems.length < 2) return;
    const sig = pantryItems.map((i) => i.name.toLowerCase()).sort().join("|");
    if (sig === lastSuggestedPantrySigRef.current) return;

    const timer = setTimeout(() => {
      lastSuggestedPantrySigRef.current = sig;
      fetchPantrySuggestions(pantryItems, true);
    }, 1100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantryItems]);

  // Meals matching pantry
  const minMatchThreshold = pantryItems.length >= 2 ? 2 : 1;
  const pantryMatchedMeals = pantryItems.length > 0
    ? meals.filter((m) => getPantryMatchStats(m, pantryItems).matchCount >= minMatchThreshold)
    : [];

  // Filtered & sorted meals (prioritizing pantry matches when pantry has items)
  const filteredMeals = meals
    .filter((meal) => {
      if (activeFilter === "pantry") {
        return getPantryMatchStats(meal, pantryItems).matchCount >= 1;
      }
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
    })
    .sort((a, b) => {
      if (pantryItems.length === 0) return 0;
      const statsA = getPantryMatchStats(a, pantryItems);
      const statsB = getPantryMatchStats(b, pantryItems);
      if (statsB.matchCount !== statsA.matchCount) {
        return statsB.matchCount - statsA.matchCount;
      }
      return statsB.ratio - statsA.ratio;
    });

  // Cycle Shuffle Pick through all non-rut meals (pantry matches first, then full diverse library)
  const spotlightPool = [...meals]
    .filter((m) => !rutMeals.some((r) => m.title.toLowerCase().includes(r.name.toLowerCase())))
    .sort((a, b) => {
      if (pantryItems.length === 0) return 0;
      const statsA = getPantryMatchStats(a, pantryItems);
      const statsB = getPantryMatchStats(b, pantryItems);
      if (statsB.matchCount !== statsA.matchCount) {
        return statsB.matchCount - statsA.matchCount;
      }
      return statsB.ratio - statsA.ratio;
    });
  const activeSpotlightPool = spotlightPool.length > 0 ? spotlightPool : meals;
  const spotlightMeal = activeSpotlightPool[spotlightIndex % Math.max(1, activeSpotlightPool.length)] || meals[0];

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-emerald-800 text-emerald-100 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-none truncate">
                Easy Low-Effort Meals
              </h1>
              <p className="text-xs text-stone-500 mt-0.5 truncate">
                Low working memory • 3-5 ingredients • No Walmart ruts
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              onClick={() => setShowAccountModal(true)}
              className={`text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                user
                  ? householdId
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    : "border-stone-300 bg-stone-50 text-stone-800 hover:bg-stone-100"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
              }`}
              title="Account sync & optional household sharing"
            >
              {user ? (
                householdId ? (
                  <>
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden md:inline">Household</span>
                    <span className="font-mono text-[10px] bg-emerald-200/80 text-emerald-950 px-1.5 py-0.2 rounded">
                      {householdId}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="hidden sm:inline">Synced</span>
                  </>
                )
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Sign In</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowRutModal(true)}
              className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Rut Tracker</span>
              <span className="bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded text-[10px]">
                {rutMeals.length}
              </span>
            </button>

            <button
              onClick={() => setShowGroceryModal(true)}
              className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
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
              Easy, balanced meals without the guesswork.
            </h2>
            <p className="text-emerald-200/90 text-xs sm:text-sm leading-relaxed">
              Every meal uses <strong>3 to 5 everyday Walmart ingredients</strong>, cooks in under 15 minutes, and puts the exact amounts right inside each step. Update your pantry anytime to unlock more ideas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowPantryModal(true)}
              className="bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-emerald-800" />
              <span>Update My Pantry ({pantryItems.length})</span>
            </button>
          </div>
        </div>

        {/* Brain-Free Generator & Filter Bar */}
        <MealGeneratorBar
          onGenerateMeal={handleGenerateMeal}
          onGenerateBatch={handleGenerateBatch}
          generatingMode={generatingMode}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          rutCount={rutMeals.length}
          groceryCount={groceryItems.length}
          pantryCount={pantryItems.length}
          pantryMatchCount={pantryMatchedMeals.length}
          onOpenRutModal={() => setShowRutModal(true)}
          onOpenGroceryModal={() => setShowGroceryModal(true)}
          onOpenRescueModal={() => setShowRescueModal(true)}
          onOpenPantryModal={() => setShowPantryModal(true)}
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    pantryItems.length > 0
                      ? handleAddMissingToGrocery(spotlightMeal)
                      : handleAddToGrocery(spotlightMeal)
                  }
                  className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-medium text-xs px-3.5 py-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                  title={
                    pantryItems.length > 0
                      ? "Add missing ingredients to Walmart list"
                      : "Add ingredients to Walmart list"
                  }
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{pantryItems.length > 0 ? "Add Missing" : "Add to List"}</span>
                </button>

                <button
                  onClick={() => setSpotlightIndex((prev) => prev + 1)}
                  className="flex-1 sm:flex-initial bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs px-3.5 py-3 rounded-xl border border-stone-200 flex items-center justify-center gap-1.5 transition-colors"
                  title="Shuffle recommendation"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle Pick</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meals Grid Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">
                {activeFilter === "pantry"
                  ? "Meals Matching Your Pantry"
                  : activeFilter === "favorites"
                  ? "Saved Favorites"
                  : activeFilter === "microwave"
                  ? "Microwave & No-Cook Meals"
                  : activeFilter === "one_skillet"
                  ? "One-Skillet & Sheet-Pan Meals"
                  : activeFilter === "healthy_boost"
                  ? "Veggie-Boosted Easy Meals"
                  : pantryItems.length > 0
                  ? "Suggested Meals (Best Pantry Matches First)"
                  : "All Low-Cognitive-Load Meals"}
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                ({filteredMeals.length})
              </span>
              {isSuggestingFromPantry && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Adding ideas for your pantry...</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {pantryItems.length > 0 && (
                <button
                  onClick={() => fetchPantrySuggestions(pantryItems, false)}
                  disabled={isSuggestingFromPantry}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>More Pantry Ideas</span>
                </button>
              )}

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
          </div>

          {filteredMeals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-stone-800">
                {activeFilter === "pantry" && pantryItems.length === 0
                  ? "Your pantry is empty"
                  : "No meals found in this filter"}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {activeFilter === "pantry" && pantryItems.length === 0
                  ? "Tap items in My Pantry to see meals you can make right now and unlock fresh suggestions."
                  : "Try clicking \"All Easy Meals\" or tap \"Generate Fresh Idea\" to create a new one."}
              </p>
              <button
                onClick={() =>
                  activeFilter === "pantry" && pantryItems.length === 0
                    ? setShowPantryModal(true)
                    : setActiveFilter("all")
                }
                className="text-xs font-semibold bg-emerald-700 text-white px-4 py-2 rounded-xl"
              >
                {activeFilter === "pantry" && pantryItems.length === 0 ? "Update My Pantry" : "Show All Meals"}
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
                  onAddMissingToGrocery={handleAddMissingToGrocery}
                  onAddExtraToGrocery={handleAddExtraToGrocery}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(meal.id)}
                  pantryItems={pantryItems}
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
          pantryItems={pantryItems}
          onClose={() => setCookingMeal(null)}
          onAddToGrocery={handleAddToGrocery}
          onAddMissingToGrocery={handleAddMissingToGrocery}
          onAddExtraToGrocery={handleAddExtraToGrocery}
          onUpdatePantryQuantity={handleUpdatePantryQuantity}
          onRemovePantryItem={handleRemovePantryItem}
        />
      )}

      {/* Account & Household Sync Modal */}
      {showAccountModal && (
        <AccountSyncModal
          user={user}
          authLoading={!authReady}
          householdId={householdId}
          householdName={householdName}
          isSyncingAction={isSyncingAction}
          syncError={syncError}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onCreateHousehold={handleCreateHousehold}
          onJoinHousehold={handleJoinHousehold}
          onLeaveHousehold={handleLeaveHousehold}
          onClose={() => {
            setSyncError(null);
            setShowAccountModal(false);
          }}
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
          onMoveCompletedToPantry={handleMoveCompletedToPantry}
          onClearAll={handleClearAllGrocery}
          onAddItem={handleAddCustomGroceryItem}
          onClose={() => setShowGroceryModal(false)}
        />
      )}

      {/* Pantry Modal */}
      {showPantryModal && (
        <PantryModal
          pantryItems={pantryItems}
          matchingMealCount={pantryMatchedMeals.length}
          isSuggesting={isSuggestingFromPantry}
          onTogglePantryItem={handleTogglePantryItem}
          onAddPantryItem={handleAddPantryItem}
          onUpdatePantryQuantity={handleUpdatePantryQuantity}
          onClearPantry={handleClearPantry}
          onRequestMoreSuggestions={() => fetchPantrySuggestions(pantryItems, false)}
          onClose={() => setShowPantryModal(false)}
        />
      )}

      {/* Ingredient Rescue Modal */}
      {showRescueModal && (
        <IngredientRescueModal
          onRescue={handleRescueIngredients}
          onCancel={handleCancelRescue}
          onClose={() => {
            handleCancelRescue();
            setShowRescueModal(false);
          }}
          isLoading={isRescuing}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
