import React, { useState, useEffect, useRef, useMemo } from "react";
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
import {
  CookingEffort,
  CookingEnvironment,
  CookingEquipment,
  DietaryRestriction,
  DormConstraints,
  GroceryItem,
  KitchenProfile,
  LivingSituation,
  Meal,
  MealAddon,
  MealType,
  PantryItem,
  RutMeal,
  SharedKitchenPreference,
  VarietyPreference,
  WalmartAisle
} from "./types";
import { DEFAULT_MEALS } from "./data/defaultMeals";
import { MealCard } from "./components/MealCard";
import StorageTag from "./components/StorageTag";
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
  evaluateMealIngredients,
  getMissingIngredients,
  getPantryMatchStats,
  normalizePantryList
} from "./utils/pantryMatch";
import {
  DEFAULT_DORM_CONSTRAINTS,
  DEFAULT_KITCHEN_PROFILE,
  EFFORT_PRESETS,
  ENVIRONMENT_PRESETS,
  STANDARD_DORM_CONSTRAINTS,
  createProfileForEnvironment,
  getEffectiveEquipment,
  getMealEligibility,
  getMealStorageProfile,
  inferMealRequirements,
  isMealDormCompatible,
  isMealEquipmentCompatible,
  normalizeDormConstraints
} from "./utils/kitchenProfile";
import { SpotlightAdjustmentAction, selectSpotlightMeal } from "./utils/spotlight";
import {
  mergeGroceryState,
  mergeOnSignInOfflineToCloud,
  mergePantryState
} from "./utils/syncMerge";
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
  sanitizeKitchenProfileForCloud,
  generateHouseholdCode
} from "./firebase";
import {
  Sparkles,
  ChefHat,
  Shuffle,
  SlidersHorizontal,
  Heart,
  CheckCircle,
  Clock,
  ArrowRight,
  PackageCheck,
  Loader2,
  Cloud,
  Users,
  ShoppingCart,
  ShoppingBag,
  X,
  AlertCircle,
  Check,
  RefreshCw,
  AlertTriangle,
  Package,
  Refrigerator,
  Snowflake
} from "lucide-react";

const DEFAULT_ID_SET = new Set(DEFAULT_MEALS.map((m) => m.id));
const PROFILE_STORAGE_KEY = "simple_chef_profile_v1";
const CLIENT_ID_STORAGE_KEY = "simple_chef_client_id";
const SPOTLIGHT_HISTORY_KEY = "simple_chef_recent_spotlights_v1";

function mergeMealsWithDefaults(customMeals: Meal[]): Meal[] {
  const uniqueCustom = customMeals.filter((m) => !DEFAULT_ID_SET.has(m.id));
  return [...uniqueCustom, ...DEFAULT_MEALS];
}

function capApiStrings(items: string[]): string[] {
  return items
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim().slice(0, 100))
    .filter((s) => s.length > 0)
    .slice(0, 25);
}

function loadInitialProfile(): KitchenProfile {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<KitchenProfile>;
      if (parsed && typeof parsed.environment === "string") {
        const validEnv: CookingEnvironment =
          parsed.environment === "full_kitchen" ||
          parsed.environment === "microwave_only" ||
          parsed.environment === "microwave_mini_fridge" ||
          parsed.environment === "limited_kitchen" ||
          parsed.environment === "custom"
            ? parsed.environment
            : DEFAULT_KITCHEN_PROFILE.environment;
        const normalizedEnv: CookingEnvironment =
          parsed.livingSituation === "dorm" &&
          validEnv === "full_kitchen" &&
          parsed.sharedKitchen !== "available_use"
            ? "microwave_mini_fridge"
            : validEnv;
        return createProfileForEnvironment(normalizedEnv, parsed);
      }
    }

    // Smooth migration from legacy keys if present
    const legacyMode = localStorage.getItem("easy_meals_kitchen_mode");
    const legacyNoFreezer = localStorage.getItem("easy_meals_no_freezer") === "true";
    if (legacyMode === "microwave_only") {
      return createProfileForEnvironment(
        legacyNoFreezer ? "microwave_only" : "microwave_mini_fridge",
        { hasFreezer: !legacyNoFreezer }
      );
    }
    if (legacyMode === "full_kitchen") {
      return createProfileForEnvironment("full_kitchen", {
        hasFreezer: !legacyNoFreezer
      });
    }
  } catch {}
  return DEFAULT_KITCHEN_PROFILE;
}

function getOrCreateClientToken(uid?: string | null): string {
  if (uid && /^[a-zA-Z0-9_-]{4,64}$/.test(uid)) return uid;
  try {
    const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,64}$/.test(existing)) {
      return existing;
    }
    const created = `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return "sc_browser_default";
  }
}

export default function App() {
  // Persisted meals (custom/AI meals + latest curated defaults)
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        return mergeMealsWithDefaults(sanitizeCustomMealsForCloud(parsed));
      }
    } catch {}
    return DEFAULT_MEALS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_favorites");
      if (saved) return sanitizeFavoritesForCloud(JSON.parse(saved));
    } catch {}
    return [];
  });

  // Optional "see less often" / twist targets (starts empty — never shames familiar comfort foods)
  const [rutMeals, setRutMeals] = useState<RutMeal[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_ruts");
      if (saved) return sanitizeRutForCloud(JSON.parse(saved));
    } catch {}
    return [];
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem("easy_meals_grocery");
      if (saved) return sanitizeGroceryForCloud(JSON.parse(saved));
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

  // Adaptive Kitchen & Cooking Effort Profile
  const [profile, setProfile] = useState<KitchenProfile>(loadInitialProfile);
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType>("any");
  const [maxTimeFilter, setMaxTimeFilter] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Firebase Auth & Sync state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [householdId, setHouseholdId] = useState<string>("");
  const [householdName, setHouseholdName] = useState<string>("");
  const [isPrivateCloudReady, setIsPrivateCloudReady] = useState<boolean>(false);
  const [isSharedCloudReady, setIsSharedCloudReady] = useState<boolean>(false);
  const [isSyncingAction, setIsSyncingAction] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // UI & Discovery state
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
  const [recentSpotlightIds, setRecentSpotlightIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SPOTLIGHT_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s): s is string => typeof s === "string").slice(0, 12);
        }
      }
    } catch {}
    return [];
  });
  const [currentSpotlightId, setCurrentSpotlightId] = useState<string | null>(null);
  const [recentSuggestions, setRecentSuggestions] = useState<Meal[]>([]);
  const [resultsRefreshTick, setResultsRefreshTick] = useState<number>(0);
  const [pulseHighlight, setPulseHighlight] = useState<boolean>(false);

  const toastTimerRef = useRef<number | null>(null);
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);
  const rescueAbortRef = useRef<AbortController | null>(null);
  const rescueCancelledByUserRef = useRef<boolean>(false);
  const pantryAbortRef = useRef<AbortController | null>(null);
  const lastSuggestedPantrySigRef = useRef<string>("");

  // Live local state refs for race-free 3-way merge & initial sign-in merge
  const localPantryRef = useRef<PantryItem[]>(pantryItems);
  const localGroceryRef = useRef<GroceryItem[]>(groceryItems);
  const localFavoritesRef = useRef<string[]>(favorites);
  const localRutRef = useRef<RutMeal[]>(rutMeals);
  const localMealsRef = useRef<Meal[]>(meals);
  const localProfileRef = useRef<KitchenProfile>(profile);
  localPantryRef.current = pantryItems;
  localGroceryRef.current = groceryItems;
  localFavoritesRef.current = favorites;
  localRutRef.current = rutMeals;
  localMealsRef.current = meals;
  localProfileRef.current = profile;

  const baselinePrivatePantryRef = useRef<PantryItem[]>([]);
  const baselinePrivateGroceryRef = useRef<GroceryItem[]>([]);
  const baselineSharedPantryRef = useRef<PantryItem[]>([]);
  const baselineSharedGroceryRef = useRef<GroceryItem[]>([]);
  const mergedOnSignInUidRef = useRef<string | null>(null);
  const initializedSharedKeyRef = useRef<string | null>(null);

  // Track last synced cloud payloads to prevent echo loops
  const lastPrivateSnapshotRef = useRef<{
    pantry: string;
    grocery: string;
    rut: string;
    favorites: string;
    customMeals: string;
    householdId: string;
    kitchenProfile: string;
  }>({
    pantry: "",
    grocery: "",
    rut: "",
    favorites: "",
    customMeals: "",
    householdId: "",
    kitchenProfile: ""
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

  useEffect(() => {
    try {
      localStorage.setItem(SPOTLIGHT_HISTORY_KEY, JSON.stringify(recentSpotlightIds));
    } catch {}
  }, [recentSpotlightIds]);

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

  const pulseTimerRef = useRef<number | null>(null);

  const flashResultsUpdated = () => {
    setResultsRefreshTick((prev) => prev + 1);
    setPulseHighlight(true);
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setPulseHighlight(false);
      pulseTimerRef.current = null;
    }, 650);
  };

  // Profile change handlers (Axis 1: Equipment; Axis 2: Effort; Axis 3: Living Situation & Dorm)
  const triggerPreferenceRefresh = (
    nextProfile: KitchenProfile,
    nextMealType: MealType = mealTypeFilter
  ) => {
    setRecentSuggestions((prev) =>
      prev.filter(
        (m) =>
          getMealEligibility(m, nextProfile, {
            mealType: nextMealType,
            effortMatchMode: "exact",
            lessFrequentList: rutMeals
          }).eligible
      )
    );
    setCurrentSpotlightId(null);
    flashResultsUpdated();
  };

  const syncBrowseFilterToEquipment = (effEq: Set<CookingEquipment>) => {
    const hasHeatOtherThanMicro =
      effEq.has("stove") || effEq.has("oven") || effEq.has("toaster") || effEq.has("air_fryer");

    if (!hasHeatOtherThanMicro && activeFilter === "one_skillet") {
      setActiveFilter("all");
    }
    if (!effEq.has("microwave") && activeFilter === "microwave") {
      setActiveFilter("all");
    }
  };

  const handleChangeEnvironment = (env: CookingEnvironment) => {
    let overrides: Partial<KitchenProfile> = { ...profile };

    if (env === "full_kitchen" && profile.livingSituation === "dorm") {
      overrides = {
        ...overrides,
        livingSituation: "standard",
        dormConstraints: { ...STANDARD_DORM_CONSTRAINTS },
        sharedKitchen: "none"
      };
    } else if (
      (env === "microwave_only" || env === "microwave_mini_fridge" || env === "limited_kitchen") &&
      profile.livingSituation === "dorm" &&
      profile.sharedKitchen === "available_use"
    ) {
      overrides = {
        ...overrides,
        sharedKitchen: "available_avoid"
      };
    }

    const nextProfile = createProfileForEnvironment(env, overrides);
    setProfile(nextProfile);
    syncBrowseFilterToEquipment(getEffectiveEquipment(nextProfile));
    triggerPreferenceRefresh(nextProfile);

    if (env === "microwave_only") {
      showToast(
        "Microwave Only active — showing shelf-stable microwave & no-cook meals."
      );
    } else if (env === "full_kitchen" && profile.livingSituation === "dorm") {
      showToast("Full Kitchen active (switched to Standard setup so stove & oven recipes show).");
    } else if (env === "custom") {
      showToast("Custom Equipment active — toggle any appliances you have below.");
    } else {
      showToast(`${ENVIRONMENT_PRESETS[env].label} active`);
    }
  };

  const handleToggleCustomEquipment = (eq: CookingEquipment) => {
    setProfile((prev) => {
      let nextHasFreezer = prev.hasFreezer;
      let nextEq = [...prev.equipment];

      if (eq === "freezer") {
        nextHasFreezer = !prev.hasFreezer;
        if (nextHasFreezer && !nextEq.includes("freezer")) {
          nextEq.push("freezer");
        } else if (!nextHasFreezer) {
          nextEq = nextEq.filter((item) => item !== "freezer");
        }
      } else if (nextEq.includes(eq)) {
        nextEq = nextEq.filter((item) => item !== eq);
      } else {
        nextEq.push(eq);
      }

      const nextDormConstraints =
        prev.livingSituation === "dorm" && eq === "freezer"
          ? {
              ...(prev.dormConstraints ?? DEFAULT_DORM_CONSTRAINTS),
              limitedFreezerSpace: !nextHasFreezer
            }
          : prev.dormConstraints;

      const updated: KitchenProfile = {
        ...prev,
        environment: "custom",
        equipment: nextEq,
        hasFreezer: nextHasFreezer,
        ...(nextDormConstraints ? { dormConstraints: nextDormConstraints } : {})
      };
      syncBrowseFilterToEquipment(getEffectiveEquipment(updated));
      triggerPreferenceRefresh(updated);
      return updated;
    });
  };

  const handleChangeOtherEquipmentLabel = (label: string) => {
    setProfile((prev) => ({
      ...prev,
      otherEquipmentLabel: label.slice(0, 60)
    }));
  };

  const handleChangeEffort = (effort: CookingEffort) => {
    const nextProfile: KitchenProfile = { ...profile, effort };
    setProfile(nextProfile);
    triggerPreferenceRefresh(nextProfile);
    showToast(`${EFFORT_PRESETS[effort].label} active`);
  };

  const handleChangeLivingSituation = (livingSituation: LivingSituation) => {
    setProfile((prev) => {
      const nextSharedKitchen: SharedKitchenPreference =
        livingSituation === "standard" ? "none" : prev.sharedKitchen ?? "none";

      // If switching to Dorm while still on the Full Kitchen default (without shared stove/oven),
      // immediately switch equipment to Microwave + Mini-Fridge so full-kitchen meals don't appear.
      const shouldSwitchOutOfFullKitchen =
        livingSituation === "dorm" &&
        prev.environment === "full_kitchen" &&
        nextSharedKitchen !== "available_use";

      const updated: KitchenProfile = shouldSwitchOutOfFullKitchen
        ? createProfileForEnvironment("microwave_mini_fridge", {
            ...prev,
            livingSituation: "dorm",
            dormConstraints: normalizeDormConstraints("dorm"),
            sharedKitchen: nextSharedKitchen
          })
        : {
            ...prev,
            livingSituation,
            dormConstraints: normalizeDormConstraints(livingSituation),
            sharedKitchen: nextSharedKitchen
          };

      syncBrowseFilterToEquipment(getEffectiveEquipment(updated));
      triggerPreferenceRefresh(updated);
      return updated;
    });
    showToast(
      livingSituation === "dorm"
        ? "Dorm / College profile active — showing dorm-safe meals only."
        : "Standard kitchen profile active."
    );
  };

  const handleToggleDormConstraint = (key: keyof DormConstraints) => {
    setProfile((prev) => {
      const currentDorm = prev.dormConstraints ?? DEFAULT_DORM_CONSTRAINTS;
      const nextVal = !currentDorm[key];
      let nextHasFreezer = prev.hasFreezer;
      let nextEquipment = [...prev.equipment];

      if (key === "limitedFreezerSpace" && prev.environment !== "microwave_only") {
        nextHasFreezer = !nextVal;
        if (nextHasFreezer && !nextEquipment.includes("freezer")) {
          nextEquipment.push("freezer");
        } else if (!nextHasFreezer) {
          nextEquipment = nextEquipment.filter((e) => e !== "freezer");
        }
      }

      const updated: KitchenProfile = {
        ...prev,
        livingSituation: "dorm",
        hasFreezer: nextHasFreezer,
        equipment: nextEquipment,
        dormConstraints: {
          ...currentDorm,
          [key]: nextVal
        }
      };
      triggerPreferenceRefresh(updated);
      return updated;
    });
  };

  const handleChangeSharedKitchen = (sharedKitchen: SharedKitchenPreference) => {
    setProfile((prev) => {
      const updated: KitchenProfile = {
        ...prev,
        sharedKitchen
      };
      syncBrowseFilterToEquipment(getEffectiveEquipment(updated));
      triggerPreferenceRefresh(updated);
      return updated;
    });
    if (sharedKitchen === "available_use") {
      showToast("Shared dorm kitchen included — stovetop & oven recipes unlocked.");
    } else if (sharedKitchen === "available_avoid") {
      showToast("Keeping meals in-room (avoiding shared hall kitchen).");
    } else {
      showToast("No shared kitchen — showing in-room meals only.");
    }
  };

  const handleToggleDietary = (tag: DietaryRestriction) => {
    setProfile((prev) => {
      const exists = prev.dietaryRestrictions.includes(tag);
      const nextTags = exists
        ? prev.dietaryRestrictions.filter((d) => d !== tag)
        : [...prev.dietaryRestrictions, tag];
      const updated: KitchenProfile = { ...prev, dietaryRestrictions: nextTags };
      triggerPreferenceRefresh(updated);
      return updated;
    });
  };

  const handleChangeVarietyPreference = (varietyPreference: VarietyPreference) => {
    const updated: KitchenProfile = { ...profile, varietyPreference };
    setProfile(updated);
    triggerPreferenceRefresh(updated);
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
        mergedOnSignInUidRef.current = null;
        initializedSharedKeyRef.current = null;
        baselinePrivatePantryRef.current = [];
        baselinePrivateGroceryRef.current = [];
        baselineSharedPantryRef.current = [];
        baselineSharedGroceryRef.current = [];
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to private user state in Firestore with offline merge & 3-way reconciliation
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
          const initPantry = sanitizePantryForCloud(localPantryRef.current);
          const initGrocery = sanitizeGroceryForCloud(localGroceryRef.current);
          const initRut = sanitizeRutForCloud(localRutRef.current);
          const initFavs = sanitizeFavoritesForCloud(localFavoritesRef.current);
          const initCustom = sanitizeCustomMealsForCloud(
            localMealsRef.current.filter((m) => !DEFAULT_ID_SET.has(m.id))
          );
          const initProfile =
            sanitizeKitchenProfileForCloud(localProfileRef.current) ?? DEFAULT_KITCHEN_PROFILE;

          baselinePrivatePantryRef.current = initPantry;
          baselinePrivateGroceryRef.current = initGrocery;
          mergedOnSignInUidRef.current = user.uid;

          lastPrivateSnapshotRef.current = {
            pantry: JSON.stringify(initPantry),
            grocery: JSON.stringify(initGrocery),
            rut: JSON.stringify(initRut),
            favorites: JSON.stringify(initFavs),
            customMeals: JSON.stringify(initCustom),
            householdId: "",
            kitchenProfile: JSON.stringify(initProfile)
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
              kitchenProfile: initProfile,
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
        const remotePantry = sanitizePantryForCloud(data.pantryItems);
        const remoteGrocery = sanitizeGroceryForCloud(data.groceryItems);
        const remoteRut = sanitizeRutForCloud(data.rutMeals);
        const remoteFavs = sanitizeFavoritesForCloud(data.favorites);
        const remoteCustom = sanitizeCustomMealsForCloud(data.customMeals);
        const remoteProfile = sanitizeKitchenProfileForCloud(data.kitchenProfile);

        const isFirstLoadForUser = mergedOnSignInUidRef.current !== user.uid;
        mergedOnSignInUidRef.current = user.uid;

        if (isFirstLoadForUser) {
          const localCustom = sanitizeCustomMealsForCloud(
            localMealsRef.current.filter((m) => !DEFAULT_ID_SET.has(m.id))
          );
          const mergedAll = mergeOnSignInOfflineToCloud({
            localPantry: sanitizePantryForCloud(localPantryRef.current),
            remotePantry,
            localGrocery: sanitizeGroceryForCloud(localGroceryRef.current),
            remoteGrocery,
            localFavorites: sanitizeFavoritesForCloud(localFavoritesRef.current),
            remoteFavorites: remoteFavs,
            localCustomMeals: localCustom,
            remoteCustomMeals: remoteCustom,
            localRutMeals: sanitizeRutForCloud(localRutRef.current),
            remoteRutMeals: remoteRut
          });

          const cleanMergedPantry = sanitizePantryForCloud(mergedAll.pantryItems);
          const cleanMergedGrocery = sanitizeGroceryForCloud(mergedAll.groceryItems);
          const cleanMergedRut = sanitizeRutForCloud(mergedAll.rutMeals);
          const cleanMergedFavs = sanitizeFavoritesForCloud(mergedAll.favorites);
          const cleanMergedCustom = sanitizeCustomMealsForCloud(mergedAll.customMeals);

          baselinePrivatePantryRef.current = remotePantry;
          baselinePrivateGroceryRef.current = remoteGrocery;

          lastPrivateSnapshotRef.current = {
            pantry: JSON.stringify(remotePantry),
            grocery: JSON.stringify(remoteGrocery),
            rut: JSON.stringify(remoteRut),
            favorites: JSON.stringify(remoteFavs),
            customMeals: JSON.stringify(remoteCustom),
            householdId: remoteHouseholdId,
            kitchenProfile: remoteProfile ? JSON.stringify(remoteProfile) : ""
          };

          setRutMeals(cleanMergedRut);
          setFavorites(cleanMergedFavs);
          setMeals(mergeMealsWithDefaults(cleanMergedCustom));
          setHouseholdId(remoteHouseholdId);
          if (remoteProfile) {
            setProfile(remoteProfile);
            triggerPreferenceRefresh(remoteProfile);
          }

          if (!remoteHouseholdId) {
            setPantryItems(cleanMergedPantry);
            setGroceryItems(cleanMergedGrocery);
            setIsSharedCloudReady(false);
            setHouseholdName("");
          }
          setIsPrivateCloudReady(true);
          return;
        }

        // Subsequent remote updates: preserve concurrent local edits via 3-way merge
        lastPrivateSnapshotRef.current = {
          pantry: JSON.stringify(remotePantry),
          grocery: JSON.stringify(remoteGrocery),
          rut: JSON.stringify(remoteRut),
          favorites: JSON.stringify(remoteFavs),
          customMeals: JSON.stringify(remoteCustom),
          householdId: remoteHouseholdId,
          kitchenProfile: remoteProfile ? JSON.stringify(remoteProfile) : ""
        };

        setRutMeals(remoteRut);
        setFavorites(remoteFavs);
        setMeals(mergeMealsWithDefaults(remoteCustom));
        setHouseholdId(remoteHouseholdId);
        if (remoteProfile && JSON.stringify(remoteProfile) !== JSON.stringify(localProfileRef.current)) {
          setProfile(remoteProfile);
          triggerPreferenceRefresh(remoteProfile);
        }

        if (!remoteHouseholdId) {
          const reconciledPantry = sanitizePantryForCloud(
            mergePantryState(
              baselinePrivatePantryRef.current,
              localPantryRef.current,
              remotePantry
            )
          );
          const reconciledGrocery = sanitizeGroceryForCloud(
            mergeGroceryState(
              baselinePrivateGroceryRef.current,
              localGroceryRef.current,
              remoteGrocery
            )
          );
          baselinePrivatePantryRef.current = remotePantry;
          baselinePrivateGroceryRef.current = remoteGrocery;
          setPantryItems(reconciledPantry);
          setGroceryItems(reconciledGrocery);
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
        const remotePantry = sanitizePantryForCloud(data.pantryItems);
        const remoteGrocery = sanitizeGroceryForCloud(data.groceryItems);

        const isFirstSharedSnap = initializedSharedKeyRef.current !== householdId;
        initializedSharedKeyRef.current = householdId;

        lastSharedSnapshotRef.current = {
          pantry: JSON.stringify(remotePantry),
          grocery: JSON.stringify(remoteGrocery)
        };

        if (isFirstSharedSnap) {
          const mergedShared = mergeOnSignInOfflineToCloud({
            localPantry: sanitizePantryForCloud(localPantryRef.current),
            remotePantry,
            localGrocery: sanitizeGroceryForCloud(localGroceryRef.current),
            remoteGrocery,
            localFavorites: [],
            remoteFavorites: [],
            localCustomMeals: [],
            remoteCustomMeals: [],
            localRutMeals: [],
            remoteRutMeals: []
          });
          baselineSharedPantryRef.current = remotePantry;
          baselineSharedGroceryRef.current = remoteGrocery;
          setPantryItems(sanitizePantryForCloud(mergedShared.pantryItems));
          setGroceryItems(sanitizeGroceryForCloud(mergedShared.groceryItems));
        } else {
          const reconciledPantry = sanitizePantryForCloud(
            mergePantryState(
              baselineSharedPantryRef.current,
              localPantryRef.current,
              remotePantry
            )
          );
          const reconciledGrocery = sanitizeGroceryForCloud(
            mergeGroceryState(
              baselineSharedGroceryRef.current,
              localGroceryRef.current,
              remoteGrocery
            )
          );
          baselineSharedPantryRef.current = remotePantry;
          baselineSharedGroceryRef.current = remoteGrocery;
          setPantryItems(reconciledPantry);
          setGroceryItems(reconciledGrocery);
        }

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
      const cleanProfile =
        sanitizeKitchenProfileForCloud(profile) ?? DEFAULT_KITCHEN_PROFILE;

      const pantryJson = JSON.stringify(cleanPantry);
      const groceryJson = JSON.stringify(cleanGrocery);
      const rutJson = JSON.stringify(cleanRut);
      const favsJson = JSON.stringify(cleanFavs);
      const customJson = JSON.stringify(cleanCustom);
      const profileJson = JSON.stringify(cleanProfile);

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
      if (profileJson !== lastPrivateSnapshotRef.current.kitchenProfile) {
        privateUpdates.kitchenProfile = cleanProfile;
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
              kitchenProfile: cleanProfile,
              updatedAt: serverTimestamp()
            };

        lastPrivateSnapshotRef.current = {
          ...lastPrivateSnapshotRef.current,
          rut: rutJson,
          favorites: favsJson,
          customMeals: customJson,
          kitchenProfile: profileJson,
          ...(householdId ? {} : { pantry: pantryJson, grocery: groceryJson })
        };
        if (!householdId) {
          baselinePrivatePantryRef.current = cleanPantry;
          baselinePrivateGroceryRef.current = cleanGrocery;
        }

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
          baselineSharedPantryRef.current = cleanPantry;
          baselineSharedGroceryRef.current = cleanGrocery;
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
    meals,
    profile
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
      baselineSharedPantryRef.current = cleanPantry;
      baselineSharedGroceryRef.current = cleanGrocery;
      initializedSharedKeyRef.current = code;

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
    } catch {
      setSyncError("Could not create household right now. Check your connection and try again.");
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
      baselinePrivatePantryRef.current = cleanPantry;
      baselinePrivateGroceryRef.current = cleanGrocery;
      initializedSharedKeyRef.current = null;

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
    } catch {
      setSyncError("Could not leave household right now. Check your connection and try again.");
    } finally {
      setIsSyncingAction(false);
    }
  };

  // Grocery handlers
  const handleAddToGrocery = (meal: Meal) => {
    const newItems: GroceryItem[] = meal.ingredients.map((ing) => ({
      id: `grocery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: ing.item,
      amount: ing.amount,
      aisle: ing.walmartAisle,
      mealTitle: meal.title,
      completed: false
    }));

    setGroceryItems((prev) => [...prev, ...newItems]);
    showToast(`Added ${newItems.length} items for "${meal.title}" to your Walmart list!`);
  };

  const handleAddMissingToGrocery = (meal: Meal) => {
    const missing = getMissingIngredients(meal, pantryItems);
    if (missing.length === 0) {
      showToast(`You already have everything for "${meal.title}" in your pantry!`);
      return;
    }

    const newItems: GroceryItem[] = missing.map((ing) => ({
      id: `grocery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
      id: `grocery-extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    const newItem: RutMeal = {
      id: `pref-${Date.now()}`,
      name,
      dateAdded: new Date().toISOString()
    };
    setRutMeals((prev) => [...prev, newItem]);
    setCurrentSpotlightId(null);
    showToast(`Added "${name}" to your preferences list.`);
  };

  const handleRemoveRutMeal = (id: string) => {
    setRutMeals((prev) => prev.filter((r) => r.id !== id));
    setCurrentSpotlightId(null);
  };

  // Adaptive AI Meal Generator ("Pick For Me" or "Try a Twist")
  const handleGenerateMeal = async (upgradeTarget?: string) => {
    const ensureVisible = () => {
      if (
        activeFilter === "favorites" ||
        activeFilter === "pantry" ||
        activeFilter === "healthy_boost"
      ) {
        setActiveFilter("all");
      }
    };

    const promoteSpotlight = (meal: Meal) => {
      setCurrentSpotlightId(meal.id);
      setRecentSpotlightIds((prev) => [meal.id, ...prev.filter((id) => id !== meal.id)].slice(0, 12));
    };

    const pickLocalFallback = (customToast?: string) => {
      const strictEligible = meals.filter(
        (m) =>
          getMealEligibility(m, profile, {
            mealType: mealTypeFilter,
            effortMatchMode: "exact",
            lessFrequentList: rutMeals
          }).eligible
      );
      const closestSafeEligible =
        strictEligible.length > 0
          ? strictEligible
          : meals.filter(
              (m) =>
                getMealEligibility(m, profile, {
                  mealType: mealTypeFilter,
                  effortMatchMode: "any",
                  lessFrequentList: rutMeals
                }).eligible
            );

      if (closestSafeEligible.length === 0) {
        setCurrentSpotlightId(null);
        showToast(
          customToast ||
            "No saved meals fit all active constraints — use the adjustment buttons in Spotlight."
        );
        return;
      }

      const unshown = closestSafeEligible.filter((m) => !recentSpotlightIds.includes(m.id));
      const pool = unshown.length > 0 ? unshown : closestSafeEligible;
      const picked = pool[Math.floor(Math.random() * pool.length)];

      promoteSpotlight(picked);
      ensureVisible();
      if (customToast) {
        showToast(customToast);
      } else if (strictEligible.length === 0) {
        showToast(`Closest effort match for your equipment: "${picked.title}"`);
      } else {
        showToast(`Selected for your setup: "${picked.title}"`);
      }
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      pickLocalFallback();
      return;
    }

    setGeneratingMode("single");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 16000);
    let rateLimited = false;
    try {
      const res = await fetch("/api/generate-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SimpleChef-Client": getOrCreateClientToken(user?.uid)
        },
        signal: controller.signal,
        body: JSON.stringify({
          kitchenProfile: profile,
          mealType: mealTypeFilter,
          ...(maxTimeFilter ? { maxCookMinutes: maxTimeFilter } : {}),
          lessFrequentMeals: capApiStrings(rutMeals.map((r) => r.name)),
          existingTitles: capApiStrings(meals.map((m) => m.title)),
          pantryItems: capApiStrings(pantryItems.map((p) => p.name)),
          ...(upgradeTarget ? { upgradeTarget } : {})
        })
      });

      if (res.status === 429) {
        rateLimited = true;
        throw new Error("Rate limited");
      }

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
        effortLevel: data.meal.effortLevel || profile.effort,
        ...(upgradeTarget ? { comfortVariationOf: upgradeTarget } : {})
      };
      setMeals((prev) => [newMeal, ...prev]);
      promoteSpotlight(newMeal);
      ensureVisible();
      showToast(`Created fresh idea: "${newMeal.title}"!`);
    } catch {
      pickLocalFallback(
        rateLimited ? "Taking a breather — try again in a few minutes" : undefined
      );
    } finally {
      clearTimeout(timeoutId);
      setGeneratingMode(null);
    }
  };

  // AI Batch Generator (3 diverse ideas matching environment + effort + meal type)
  const handleGenerateBatch = async () => {
    const ensureBatchVisible = () => {
      if (
        activeFilter === "favorites" ||
        activeFilter === "pantry" ||
        activeFilter === "healthy_boost"
      ) {
        setActiveFilter("all");
      }
    };

    const promoteLocalBatchFallback = (customToast?: string) => {
      const strictEligible = meals.filter(
        (m) =>
          getMealEligibility(m, profile, {
            mealType: mealTypeFilter,
            effortMatchMode: "exact",
            lessFrequentList: rutMeals
          }).eligible
      );
      const safeAnyEffort = meals.filter(
        (m) =>
          getMealEligibility(m, profile, {
            mealType: "any",
            effortMatchMode: "any",
            lessFrequentList: rutMeals
          }).eligible
      );
      const basePool = strictEligible.length >= 3 ? strictEligible : safeAnyEffort;

      if (basePool.length === 0) {
        setRecentSuggestions([]);
        showToast(
          customToast ||
            "No saved meals fit your active equipment & dietary filters — adjust filters above."
        );
        return;
      }

      const shuffled = [...basePool].sort(() => Math.random() - 0.5).slice(0, 3);
      setRecentSuggestions(shuffled);
      setCurrentSpotlightId(shuffled[0].id);
      setRecentSpotlightIds((prev) =>
        [shuffled[0].id, ...prev.filter((id) => id !== shuffled[0].id)].slice(0, 12)
      );
      ensureBatchVisible();
      showToast(customToast || "Surfaced fresh meal picks — compare their ingredients below!");
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      promoteLocalBatchFallback();
      return;
    }

    setGeneratingMode("batch");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    let rateLimited = false;
    try {
      const res = await fetch("/api/generate-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SimpleChef-Client": getOrCreateClientToken(user?.uid)
        },
        signal: controller.signal,
        body: JSON.stringify({
          kitchenProfile: profile,
          mealType: mealTypeFilter,
          ...(maxTimeFilter ? { maxCookMinutes: maxTimeFilter } : {}),
          lessFrequentMeals: capApiStrings(rutMeals.map((r) => r.name)),
          existingTitles: capApiStrings(meals.map((m) => m.title)),
          pantryItems: capApiStrings(pantryItems.map((p) => p.name))
        })
      });

      if (res.status === 429) {
        rateLimited = true;
        throw new Error("Rate limited");
      }

      if (!res.ok) throw new Error("Batch generation failed");
      const data = await res.json();
      const batch: Meal[] = Array.isArray(data?.meals) ? data.meals : [];
      if (batch.length === 0) throw new Error("No batch meals returned");

      const stamped: Meal[] = batch.map((m, idx) => ({
        ...m,
        id: `ai-batch-${Date.now()}-${idx}`,
        effortLevel: m.effortLevel || profile.effort
      }));

      setMeals((prev) => {
        const existingLower = new Set(prev.map((p) => p.title.toLowerCase()));
        const unique = stamped.filter((s) => !existingLower.has(s.title.toLowerCase()));
        return [...unique, ...prev];
      });
      setRecentSuggestions(stamped);
      setCurrentSpotlightId(stamped[0].id);
      setRecentSpotlightIds((prev) =>
        [stamped[0].id, ...prev.filter((id) => id !== stamped[0].id)].slice(0, 12)
      );
      ensureBatchVisible();
      showToast(`Added ${stamped.length} new meal ideas — compare ingredients below!`);
    } catch {
      promoteLocalBatchFallback(
        rateLimited ? "Taking a breather — try again in a few minutes" : undefined
      );
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

  // Turn random ingredients into 3 distinct meal options before cooking
  const handleRescueIngredients = async (
    ingredients: string[],
    excludeTitles: string[] = []
  ): Promise<Meal[]> => {
    const cleanIngredients = capApiStrings(ingredients);
    const excludeLower = new Set(excludeTitles.map((t) => t.toLowerCase()));
    const ingLabel = cleanIngredients.slice(0, 2).join(" & ");
    const ingAll = cleanIngredients.join(", ");

    const buildFallbackRescueOptions = (): Meal[] => {
      const baseIngs: Meal["ingredients"] = cleanIngredients.slice(0, 5).map((item) => ({
        item,
        amount: "1 portion",
        walmartAisle: "Pantry / Canned"
      }));

      const matchingLibrary = meals
        .filter(
          (m) =>
            !excludeLower.has(m.title.toLowerCase()) &&
            isMealEquipmentCompatible(m, profile).compatible &&
            isMealDormCompatible(m, profile).compatible
        )
        .map((m) => {
          const overlap = m.ingredients.filter((ing) =>
            cleanIngredients.some(
              (c) =>
                ing.item.toLowerCase().includes(c.toLowerCase()) ||
                c.toLowerCase().includes(ing.item.toLowerCase())
            )
          ).length;
          return { meal: m, overlap };
        })
        .filter((x) => x.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 2)
        .map((x) => x.meal);

      const now = Date.now();
      const effectiveEq = getEffectiveEquipment(profile);
      const hasStove = effectiveEq.has("stove");
      const hasMicro = effectiveEq.has("microwave");

      const noCookOption: Meal = {
        id: `rescue-nocook-${now}-2`,
        title: `2-Min No-Cook ${ingLabel} Mix`,
        tagline: `Zero heat or pan cleanup — combine ${ingAll} together on a plate or bowl right now.`,
        prepMinutes: 2,
        cookMinutes: 0,
        category: "assembly",
        effortLevel: "very_low",
        requiredEquipment: [],
        ingredients: baseIngs,
        instructions: [
          {
            stepNumber: 1,
            title: "Combine in Bowl or Wrap",
            instruction: `Put ${ingAll} together in a bowl (or fold into a tortilla if you have one).`,
            timerSeconds: 0
          },
          {
            stepNumber: 2,
            title: "Season & Eat",
            instruction:
              "Add a pinch of salt, pepper, or your favorite sauce/dressing and eat immediately.",
            timerSeconds: 0
          }
        ],
        whyItWorks: "Works with zero appliances and almost zero dishes.",
        rutAlternativeNote: "Fast no-heat meal from what you already have."
      };

      const skilletOption: Meal = {
        id: `rescue-skillet-${now}-2`,
        title: `Quick ${ingLabel} Skillet Toss`,
        tagline: `A warm, lightly crisped 1-pan meal made with ${ingAll} in about 7 minutes.`,
        prepMinutes: 2,
        cookMinutes: 5,
        category: "one_skillet",
        effortLevel: "low",
        requiredEquipment: ["stove"],
        ingredients: baseIngs,
        instructions: [
          {
            stepNumber: 1,
            title: "Heat Pan & Add Ingredients",
            instruction: `Warm a non-stick skillet over medium heat with 1 tablespoon of oil or butter. Add ${ingAll}.`,
            timerSeconds: 0
          },
          {
            stepNumber: 2,
            title: "Sizzle & Season",
            instruction:
              "Toss and stir for 5 minutes until heated through and lightly browned, adding salt and pepper.",
            timerSeconds: 300
          },
          {
            stepNumber: 3,
            title: "Plate & Serve",
            instruction: "Scoop onto a plate or into a bowl and enjoy hot.",
            timerSeconds: 0
          }
        ],
        whyItWorks: "Pan heat makes simple staples taste like a cooked dinner with minimal effort.",
        rutAlternativeNote: "Quick stovetop meal using items you want to finish."
      };

      const microBowlOption: Meal = {
        id: `rescue-micro-${now}-1`,
        title: `3-Min ${ingLabel} Warm Bowl`,
        tagline: `A fast, no-pan microwave bowl combining ${ingAll} with minimal cleanup.`,
        prepMinutes: 1,
        cookMinutes: 2,
        category: "microwave",
        effortLevel: "very_low",
        requiredEquipment: ["microwave"],
        ingredients: baseIngs,
        instructions: [
          {
            stepNumber: 1,
            title: "Combine in Bowl",
            instruction: `Add ${ingAll} into a microwave-safe bowl with a splash of water or pinch of salt.`,
            timerSeconds: 0
          },
          {
            stepNumber: 2,
            title: "Microwave Hot",
            instruction:
              "Cover loosely with a paper towel and microwave for 90 seconds to 2 minutes until steaming hot.",
            timerSeconds: 120
          },
          {
            stepNumber: 3,
            title: "Stir & Eat",
            instruction: "Give it one quick stir and eat straight from the bowl.",
            timerSeconds: 0
          }
        ],
        whyItWorks: "Zero pans to wash and uses exactly what you picked right now.",
        rutAlternativeNote: "Turns loose items into a hot bowl in 3 minutes."
      };

      const microPlateOption: Meal = {
        id: `rescue-plate-${now}-3`,
        title: `Easy ${ingLabel} Warm Plate`,
        tagline: `A simple customizable plate pairing ${ingAll} together with zero fuss.`,
        prepMinutes: 3,
        cookMinutes: hasMicro ? 2 : 0,
        category: hasMicro ? "microwave" : "assembly",
        effortLevel: "very_low",
        requiredEquipment: hasMicro ? ["microwave"] : [],
        ingredients: baseIngs,
        instructions: [
          {
            stepNumber: 1,
            title: "Prep on One Plate",
            instruction: `Arrange ${ingAll} together on a large microwave-safe plate or shallow bowl.`,
            timerSeconds: 0
          },
          {
            stepNumber: 2,
            title: hasMicro ? "Warm Briefly" : "Toss & Dress",
            instruction: hasMicro
              ? "Cover lightly with a paper towel and microwave 90 seconds until warm, keeping cold toppings on the side."
              : "Toss gently with olive oil, salt, pepper, or your favorite condiment.",
            timerSeconds: hasMicro ? 90 : 0
          },
          {
            stepNumber: 3,
            title: "Season & Dig In",
            instruction: "Finish with seasoning or sauce and eat right away.",
            timerSeconds: 0
          }
        ],
        whyItWorks: "Keeps ingredients balanced on one plate without extra cookware.",
        rutAlternativeNote: "Simple meal from loose kitchen items."
      };

      const syntheticOptions: Meal[] = [
        ...(hasMicro ? [microBowlOption] : []),
        ...(hasStove ? [skilletOption] : [noCookOption]),
        microPlateOption,
        noCookOption
      ];

      const picked: Meal[] = [...matchingLibrary];
      const usedTitles = new Set(picked.map((m) => m.title.toLowerCase()));
      for (const opt of syntheticOptions) {
        if (picked.length >= 3) break;
        if (
          !usedTitles.has(opt.title.toLowerCase()) &&
          isMealEquipmentCompatible(opt, profile).compatible &&
          isMealDormCompatible(opt, profile).compatible
        ) {
          usedTitles.add(opt.title.toLowerCase());
          picked.push(opt);
        }
      }
      return picked.slice(0, 3);
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineOptions = buildFallbackRescueOptions();
      showToast("Here are 3 quick meal options from your ingredients!");
      return offlineOptions;
    }

    rescueAbortRef.current?.abort();
    const controller = new AbortController();
    rescueAbortRef.current = controller;
    rescueCancelledByUserRef.current = false;
    setIsRescuing(true);
    const timeoutId = setTimeout(() => controller.abort(), 16000);
    let rateLimited = false;

    try {
      const res = await fetch("/api/ingredients-to-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SimpleChef-Client": getOrCreateClientToken(user?.uid)
        },
        signal: controller.signal,
        body: JSON.stringify({
          ingredients: cleanIngredients,
          lessFrequentMeals: capApiStrings(rutMeals.map((r) => r.name)),
          existingTitles: capApiStrings(excludeTitles),
          kitchenProfile: profile,
          mealType: mealTypeFilter
        })
      });

      if (res.status === 429) {
        rateLimited = true;
        throw new Error("Rate limited");
      }

      if (!res.ok) throw new Error("Could not process ingredients");
      const data = await res.json();

      if (rescueCancelledByUserRef.current) return [];

      const rawList: Meal[] = Array.isArray(data?.meals)
        ? data.meals
        : data?.meal?.title
        ? [data.meal]
        : [];

      const now = Date.now();
      const stamped = sanitizeCustomMealsForCloud(
        rawList.map((m, idx) => ({
          ...m,
          id: m.id || `rescue-${now}-${idx}`,
          category: m.category || (profile.equipment.includes("stove") ? "one_skillet" : "microwave")
        }))
      );

      if (stamped.length === 0) {
        throw new Error("Incomplete meal options returned");
      }

      return stamped;
    } catch {
      if (rescueCancelledByUserRef.current) {
        return [];
      }
      const fallbackOptions = buildFallbackRescueOptions();
      showToast(
        rateLimited
          ? "Taking a breather — try again in a few minutes"
          : "Showing 3 quick options made from your ingredients!"
      );
      return fallbackOptions;
    } finally {
      clearTimeout(timeoutId);
      if (rescueAbortRef.current === controller) {
        rescueAbortRef.current = null;
      }
      setIsRescuing(false);
    }
  };

  const saveRescueSelectionToLibrary = (chosen: Meal, allOptions: Meal[]) => {
    setMeals((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = [chosen, ...allOptions.filter((m) => m.id !== chosen.id)].filter(
        (m) => !existingIds.has(m.id)
      );
      const rest = prev.filter((m) => m.id !== chosen.id);
      const promotedChosen = existingIds.has(chosen.id) ? [chosen] : [];
      return [...newOnes, ...promotedChosen, ...rest];
    });
    if (
      activeFilter === "favorites" ||
      activeFilter === "pantry" ||
      activeFilter === "healthy_boost"
    ) {
      setActiveFilter("all");
    }
    setCurrentSpotlightId(chosen.id);
  };

  const handleCookRescueOption = (meal: Meal, allOptions: Meal[]) => {
    saveRescueSelectionToLibrary(meal, allOptions);
    setShowRescueModal(false);
    setCookingMeal(meal);
    showToast(`Starting: "${meal.title}"`);
  };

  const handleViewRescueOption = (meal: Meal, allOptions: Meal[]) => {
    saveRescueSelectionToLibrary(meal, allOptions);
    setShowRescueModal(false);
    showToast(`"${meal.title}" is ready in Spotlight!`);
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
    let rateLimited = false;

    try {
      const res = await fetch("/api/pantry-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SimpleChef-Client": getOrCreateClientToken(user?.uid)
        },
        signal: controller.signal,
        body: JSON.stringify({
          pantryItems: capApiStrings(itemsToUse.map((i) => i.name)),
          existingTitles: capApiStrings(meals.map((m) => m.title)),
          lessFrequentMeals: capApiStrings(rutMeals.map((r) => r.name)),
          kitchenProfile: profile,
          mealType: mealTypeFilter
        })
      });

      if (res.status === 429) {
        rateLimited = true;
        throw new Error("Rate limited");
      }

      if (!res.ok) throw new Error("Failed pantry suggestions");
      const data = await res.json();
      const suggested: Meal[] = Array.isArray(data?.meals) ? data.meals : [];
      if (suggested.length > 0) {
        const stamped: Meal[] = suggested.map((m, idx) => ({
          ...m,
          id: `pantry-meal-${Date.now()}-${idx}`,
          effortLevel: m.effortLevel || profile.effort
        }));
        setMeals((prev) => {
          const existingTitlesLower = new Set(prev.map((p) => p.title.toLowerCase()));
          const uniqueNew = stamped.filter((s) => !existingTitlesLower.has(s.title.toLowerCase()));
          return [...uniqueNew, ...prev];
        });
        if (!silent) {
          setRecentSuggestions(stamped);
        }
        showToast(`Added ${stamped.length} new meal ideas from your pantry!`);
      } else if (!silent) {
        showToast("Updated matches using your saved meal library.");
      }
    } catch {
      if (rateLimited) {
        showToast("Taking a breather — try again in a few minutes");
      } else if (!silent) {
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

  // Meals strictly compatible with active equipment, effort, dietary, variety, and meal type
  const eligibleMeals = useMemo(() => {
    return meals.filter(
      (m) =>
        getMealEligibility(m, profile, {
          mealType: mealTypeFilter,
          effortMatchMode: "exact",
          lessFrequentList: rutMeals
        }).eligible
    );
  }, [meals, profile, mealTypeFilter, rutMeals]);

  // Pantry-matched count within the active environment/effort window
  const minMatchThreshold = pantryItems.length >= 2 ? 2 : 1;
  const pantryMatchedMeals = useMemo(() => {
    if (pantryItems.length === 0) return [];
    return eligibleMeals.filter(
      (m) => getPantryMatchStats(m, pantryItems).matchCount >= minMatchThreshold
    );
  }, [eligibleMeals, pantryItems, minMatchThreshold]);

  // Filtered & sorted meal catalog
  const filteredMeals = useMemo(() => {
    return eligibleMeals
      .filter((meal) => {
        const reqs = inferMealRequirements(meal);
        if (maxTimeFilter !== null && meal.prepMinutes + meal.cookMinutes > maxTimeFilter) {
          return false;
        }
        if (activeFilter === "pantry") {
          return getPantryMatchStats(meal, pantryItems).matchCount >= 1;
        }
        if (activeFilter === "favorites") {
          return favorites.includes(meal.id);
        }
        if (activeFilter === "microwave") {
          return meal.category === "microwave" || reqs.requiredEquipment.includes("microwave");
        }
        if (activeFilter === "assembly") {
          return meal.category === "assembly" || reqs.requiredEquipment.length === 0;
        }
        if (activeFilter === "one_skillet") {
          return (
            meal.category === "one_skillet" ||
            meal.category === "sheet_pan" ||
            reqs.requiredEquipment.includes("stove") ||
            reqs.requiredEquipment.includes("oven") ||
            reqs.requiredEquipment.includes("toaster") ||
            reqs.requiredEquipment.includes("air_fryer")
          );
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
  }, [eligibleMeals, maxTimeFilter, activeFilter, pantryItems, favorites]);

  // Adaptive Spotlight Selection (reacts immediately to equipment/effort/dietary/variety/browse filters)
  const spotlightResult = useMemo(() => {
    const basePool =
      activeFilter !== "all"
        ? filteredMeals
        : maxTimeFilter !== null
        ? meals.filter((m) => m.prepMinutes + m.cookMinutes <= maxTimeFilter)
        : meals;
    return selectSpotlightMeal({
      meals: basePool,
      profile,
      lessFrequentList: rutMeals,
      pantryItems,
      recentSpotlightIds,
      currentSpotlightId,
      mealType: mealTypeFilter,
      forceNewPick: false
    });
  }, [
    meals,
    filteredMeals,
    activeFilter,
    maxTimeFilter,
    profile,
    rutMeals,
    pantryItems,
    recentSpotlightIds,
    currentSpotlightId,
    mealTypeFilter
  ]);

  useEffect(() => {
    if (spotlightResult.meal && spotlightResult.meal.id !== currentSpotlightId) {
      setCurrentSpotlightId(spotlightResult.meal.id);
      setRecentSpotlightIds(spotlightResult.updatedRecentIds);
    } else if (!spotlightResult.meal && currentSpotlightId !== null) {
      setCurrentSpotlightId(null);
    }
  }, [spotlightResult.meal, spotlightResult.updatedRecentIds, currentSpotlightId]);

  const handleNextSpotlightPick = () => {
    const basePool =
      activeFilter !== "all"
        ? filteredMeals
        : maxTimeFilter !== null
        ? meals.filter((m) => m.prepMinutes + m.cookMinutes <= maxTimeFilter)
        : meals;
    const nextRes = selectSpotlightMeal({
      meals: basePool,
      profile,
      lessFrequentList: rutMeals,
      pantryItems,
      recentSpotlightIds,
      currentSpotlightId,
      mealType: mealTypeFilter,
      forceNewPick: true
    });
    if (nextRes.meal) {
      setCurrentSpotlightId(nextRes.meal.id);
      setRecentSpotlightIds(nextRes.updatedRecentIds);
    }
  };

  const handleSpotlightAdjustment = (action: SpotlightAdjustmentAction) => {
    if (action === "generate_ai") {
      handleGenerateMeal();
    } else if (action === "relax_effort") {
      const effectiveEq = getEffectiveEquipment(profile);
      const nextEffort: CookingEffort =
        profile.effort === "normal" && !effectiveEq.has("stove") && !effectiveEq.has("oven")
          ? "moderate"
          : "low";
      handleChangeEffort(nextEffort);
    } else if (action === "add_fridge") {
      if (profile.environment === "microwave_only") {
        handleChangeEnvironment("microwave_mini_fridge");
      } else {
        handleToggleCustomEquipment("fridge");
      }
    } else if (action === "use_shared_kitchen") {
      handleChangeSharedKitchen("available_use");
    } else if (action === "reset_filters") {
      setMealTypeFilter("any");
      setMaxTimeFilter(null);
      setActiveFilter("all");
      setProfile((prev) => ({
        ...prev,
        dietaryRestrictions: [],
        varietyPreference: "balanced"
      }));
      setCurrentSpotlightId(null);
      flashResultsUpdated();
      showToast("Filters reset to match more meals.");
    }
  };

  const spotlightMeal = spotlightResult.meal;
  const spotlightEval = spotlightMeal
    ? evaluateMealIngredients(spotlightMeal, pantryItems)
    : null;
  const spotlightReqs = spotlightMeal ? inferMealRequirements(spotlightMeal) : null;
  const spotlightStorage = spotlightMeal ? getMealStorageProfile(spotlightMeal) : null;

  const activeEnvLabel =
    profile.environment === "custom"
      ? `Custom (${
          profile.equipment
            .map((e) =>
              e === "other" && profile.otherEquipmentLabel
                ? profile.otherEquipmentLabel
                : e.replace(/_/g, " ")
            )
            .join(", ") || "No-Cook"
        })`
      : ENVIRONMENT_PRESETS[profile.environment].label;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
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
                Simple Chef
              </h1>
              <p className="text-xs text-stone-500 mt-0.5 truncate">
                {activeEnvLabel}
                {profile.livingSituation === "dorm"
                  ? profile.sharedKitchen === "available_use"
                    ? " · Dorm (Shared Kitchen)"
                    : " · Dorm Mode"
                  : ""}{" "}
                · {EFFORT_PRESETS[profile.effort].label}
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
                    <Cloud className="w-3.5 h-3.5 text-emerald-700" />
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
              className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
              title="Meal variety & comfort preferences"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Variety</span>
              {rutMeals.length > 0 && (
                <span className="bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded text-[10px]">
                  {rutMeals.length}
                </span>
              )}
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
        {/* Adaptive Welcome Banner */}
        <div className="bg-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-50">
              Meals that fit your kitchen, energy, and pantry.
            </h2>
            <p className="text-emerald-200/90 text-xs sm:text-sm leading-relaxed">
              Pick your cooking equipment and desired effort level independently below — from zero-prep microwave dorm meals to full-kitchen cooking, with exact measurements inline inside every step.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowPantryModal(true)}
              className="bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-emerald-800" />
              <span>My Pantry ({pantryItems.length})</span>
            </button>
          </div>
        </div>

        {/* Adaptive Hubs, Environment, Effort & Filter Bar */}
        <MealGeneratorBar
          profile={profile}
          eligibleCount={eligibleMeals.length}
          onChangeEnvironment={handleChangeEnvironment}
          onToggleCustomEquipment={handleToggleCustomEquipment}
          onChangeOtherEquipmentLabel={handleChangeOtherEquipmentLabel}
          onChangeEffort={handleChangeEffort}
          onChangeLivingSituation={handleChangeLivingSituation}
          onToggleDormConstraint={handleToggleDormConstraint}
          onChangeSharedKitchen={handleChangeSharedKitchen}
          onToggleDietary={handleToggleDietary}
          onPickForMe={() => handleGenerateMeal()}
          onGenerateBatch={handleGenerateBatch}
          onUseWhatIHave={() => {
            setActiveFilter((prev) => (prev === "pantry" ? "all" : "pantry"));
            setCurrentSpotlightId(null);
            flashResultsUpdated();
            resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onBrowseMeals={() => {
            setActiveFilter("all");
            setCurrentSpotlightId(null);
            flashResultsUpdated();
            resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onOpenFavorites={() => {
            setActiveFilter((prev) => (prev === "favorites" ? "all" : "favorites"));
            setCurrentSpotlightId(null);
            flashResultsUpdated();
            resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          generatingMode={generatingMode}
          activeMethodFilter={activeFilter}
          onSelectMethodFilter={(nextFilter) => {
            setActiveFilter(nextFilter);
            setCurrentSpotlightId(null);
            flashResultsUpdated();
          }}
          mealTypeFilter={mealTypeFilter}
          onChangeMealTypeFilter={(nextType) => {
            setMealTypeFilter(nextType);
            triggerPreferenceRefresh(profile, nextType);
          }}
          maxTimeFilter={maxTimeFilter}
          onChangeMaxTimeFilter={(nextMax) => {
            setMaxTimeFilter(nextMax);
            setCurrentSpotlightId(null);
            flashResultsUpdated();
          }}
          pantryCount={pantryItems.length}
          pantryMatchCount={pantryMatchedMeals.length}
          groceryCount={groceryItems.length}
          favoritesCount={favorites.length}
          lessFrequentCount={rutMeals.length}
          onOpenPreferencesModal={() => setShowRutModal(true)}
          onOpenGroceryModal={() => setShowGroceryModal(true)}
          onOpenRescueModal={() => setShowRescueModal(true)}
          onOpenPantryModal={() => setShowPantryModal(true)}
          spotlightTitle={spotlightMeal?.title ?? null}
          resultsRefreshTick={resultsRefreshTick}
          onJumpToResults={() =>
            resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        />

        {/* Active Setup Summary Window */}
        <div
          ref={resultsSectionRef}
          className={`scroll-mt-20 rounded-2xl border px-4 py-3 flex flex-wrap items-center justify-between gap-2 transition-all duration-300 ${
            pulseHighlight
              ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30"
              : "border-stone-200 bg-white"
          }`}
        >
          <div className="text-xs sm:text-sm font-semibold text-stone-800">
            <span>
              {activeEnvLabel} · {EFFORT_PRESETS[profile.effort].label}
              {profile.livingSituation === "dorm"
                ? profile.sharedKitchen === "available_use"
                  ? " · Dorm Setup (Shared Kitchen)"
                  : " · Dorm Setup"
                : ""}
              :{" "}
              <strong className="text-emerald-800">
                {filteredMeals.length} matching meal{filteredMeals.length === 1 ? "" : "s"}
              </strong>
            </span>
            {profile.environment === "microwave_only" && (
              <span className="text-stone-500 font-normal ml-2">
                (Shelf-stable microwave &amp; no-cook only — pick Micro + Mini-Fridge for chilled items)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(activeFilter !== "all" ||
              mealTypeFilter !== "any" ||
              maxTimeFilter !== null ||
              profile.dietaryRestrictions.length > 0) && (
              <button
                type="button"
                onClick={() => handleSpotlightAdjustment("reset_filters")}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
              >
                Reset Filters
              </button>
            )}
            <span className="text-xs text-stone-500">
              {pantryItems.length > 0
                ? `${pantryMatchedMeals.length} match your pantry`
                : "Add pantry items to see what you already own"}
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison Strip When New Suggestions Arrive */}
        {recentSuggestions.length > 0 && (
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  Compare Your {recentSuggestions.length} New Ideas
                </h3>
                <p className="text-xs text-stone-600">
                  Review ingredients and pantry matches below before picking one to cook.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRecentSuggestions([])}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Dismiss suggestions comparison"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentSuggestions.map((item) => {
                const evalRes = evaluateMealIngredients(item, pantryItems);
                const missing = evalRes.missing;
                const totalMins = item.prepMinutes + item.cookMinutes;
                const itemStorage = getMealStorageProfile(item);
                const methodLabel =
                  item.category === "assembly"
                    ? "No-Cook"
                    : item.category === "microwave"
                    ? "Microwave"
                    : item.category === "sheet_pan"
                    ? "Oven / Air Fryer"
                    : item.category === "comfort"
                    ? "Classic"
                    : "Skillet / Pot";
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-stone-500 font-medium mt-0.5 flex flex-wrap items-center gap-x-1.5">
                          <span>{methodLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{totalMins}m</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {itemStorage.requiresFreezer
                              ? "Needs Freezer"
                              : itemStorage.requiresFridge
                              ? "Needs Fridge"
                              : "Shelf-Stable"}
                          </span>
                          {pantryItems.length > 0 && (
                            <span className="text-emerald-700 font-semibold">
                              · {missing.length === 0 ? "Have all" : `Buy ${missing.length}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">{item.tagline}</p>

                      <div className="space-y-1 pt-1 border-t border-stone-200/70">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                          What You Need ({item.ingredients.length}):
                        </div>
                        <ul className="space-y-1">
                          {item.ingredients.map((ing, i) => {
                            const res = evalRes.resolutions[i];
                            const isExact = pantryItems.length > 0 && res?.tier === "exact";
                            const isSub = pantryItems.length > 0 && res?.tier === "substitution";
                            const isRelated =
                              pantryItems.length > 0 && res?.tier === "related_not_equivalent";
                            return (
                              <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5">
                                {isExact ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                                ) : isSub ? (
                                  <RefreshCw className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                                ) : isRelated ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                ) : (
                                  <ShoppingBag className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                )}
                                <span>
                                  <strong className="font-semibold text-stone-900">{ing.amount}</strong>{" "}
                                  {ing.item}
                                  {isExact && (
                                    <span className="text-[10px] text-emerald-700 font-semibold ml-1">
                                      (in pantry)
                                    </span>
                                  )}
                                  {isSub && res.matchedItem && (
                                    <span className="text-[10px] text-teal-700 font-semibold ml-1">
                                      (swap: {res.matchedItem.name})
                                    </span>
                                  )}
                                  {isRelated && res.matchedItem && (
                                    <span className="text-[10px] text-amber-800 font-medium ml-1">
                                      (have {res.matchedItem.name} — different)
                                    </span>
                                  )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRecentSuggestions([]);
                          setCookingMeal(item);
                        }}
                        className="flex-1 min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                      >
                        Cook This
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          pantryItems.length > 0
                            ? handleAddMissingToGrocery(item)
                            : handleAddToGrocery(item)
                        }
                        className="min-h-[44px] bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                      >
                        {pantryItems.length > 0 ? "+ Missing" : "+ List"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adaptive Spotlight Card (or Clear Empty Explanation + Adjustment Buttons) */}
        {spotlightMeal && spotlightEval && spotlightReqs && spotlightStorage ? (
          <div
            className={`bg-white border-2 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all duration-300 ${
              pulseHighlight
                ? "border-emerald-500 ring-2 ring-emerald-500/20"
                : "border-emerald-700/30"
            }`}
          >
            <div className="space-y-2.5 max-w-2xl flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Spotlight Pick
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{spotlightMeal.prepMinutes + spotlightMeal.cookMinutes}m total</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>{EFFORT_PRESETS[spotlightReqs.effortLevel].label}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  {spotlightStorage.requiresFreezer ? (
                    <Snowflake className="w-3 h-3" />
                  ) : spotlightStorage.requiresFridge ? (
                    <Refrigerator className="w-3 h-3" />
                  ) : (
                    <Package className="w-3 h-3" />
                  )}
                  <span>
                    {spotlightStorage.requiresFreezer
                      ? "Needs Freezer"
                      : spotlightStorage.requiresFridge
                      ? "Needs Fridge"
                      : "Shelf-Stable"}
                  </span>
                </span>
                <span aria-hidden="true">·</span>
                <span>{spotlightResult.eligiblePoolCount} eligible</span>
              </div>

              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                {spotlightMeal.title}
              </h3>
              <p className="text-sm text-stone-600">{spotlightMeal.tagline}</p>

              {/* High-visibility Ingredient Checklist with 3-tier clarity */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-stone-600">
                    What This Meal Needs ({spotlightMeal.ingredients.length})
                  </span>
                  {pantryItems.length > 0 && (
                    <span className="font-semibold text-emerald-700">
                      {spotlightEval.missing.length === 0
                        ? "All covered in pantry"
                        : `Have ${spotlightEval.matchCount} · Need ${spotlightEval.missing.length}`}
                    </span>
                  )}
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {spotlightMeal.ingredients.map((ing, idx) => {
                    const res = pantryItems.length > 0 ? spotlightEval.resolutions[idx] : undefined;
                    const isExact = res?.tier === "exact";
                    const isSub = res?.tier === "substitution";
                    const isRelated = res?.tier === "related_not_equivalent";
                    return (
                      <li
                        key={idx}
                        className="text-xs text-stone-700 flex items-start justify-between gap-2"
                      >
                        <span className="flex items-start gap-1.5 min-w-0">
                          {isExact && res.quantitySufficient ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          ) : isSub ? (
                            <RefreshCw className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                          ) : isRelated || (isExact && !res.quantitySufficient) ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          )}
                          <span>
                            <strong className="font-semibold text-stone-900">{ing.amount}</strong>{" "}
                            {ing.item}
                            {ing.optional && (
                              <span className="ml-1 text-[10px] text-stone-500 italic">
                                (optional)
                              </span>
                            )}
                            {isExact && res.quantitySufficient && (
                              <span className="ml-1 text-[10px] font-semibold text-emerald-700">
                                (in pantry)
                              </span>
                            )}
                            {isExact && !res.quantitySufficient && (
                              <span className="ml-1 text-[10px] font-semibold text-amber-700">
                                ({res.note})
                              </span>
                            )}
                            {isSub && (
                              <span className="ml-1 text-[10px] font-semibold text-teal-700">
                                (swap: {res.matchedItem?.name})
                              </span>
                            )}
                            {isRelated && (
                              <span className="ml-1 text-[10px] font-medium text-amber-800">
                                (have {res.matchedItem?.name} — different)
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-[11px] text-stone-500 whitespace-nowrap">
                            {ing.walmartAisle}
                          </span>
                          <StorageTag ingredient={ing} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="text-xs text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                <span className="font-bold">Why it works: </span>
                <span>{spotlightMeal.whyItWorks}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setCookingMeal(spotlightMeal)}
                className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Cook Step-by-Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    pantryItems.length > 0
                      ? handleAddMissingToGrocery(spotlightMeal)
                      : handleAddToGrocery(spotlightMeal)
                  }
                  className="flex-1 min-h-[44px] bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-medium text-xs px-3.5 py-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{pantryItems.length > 0 ? "Add Missing" : "Add to List"}</span>
                </button>

                <button
                  onClick={handleNextSpotlightPick}
                  className="flex-1 min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs px-3.5 py-3 rounded-xl border border-stone-200 flex items-center justify-center gap-1.5 transition-colors"
                  title="Pick another eligible Spotlight meal without repeating recent picks"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Next Pick</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  No Spotlight Meal Matches This Exact Combination Yet
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  {spotlightResult.emptyReason ||
                    "No saved meal fits all active equipment, effort, and filter constraints."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {spotlightResult.suggestedAdjustments.map((adj) => (
                <button
                  key={adj.id}
                  type="button"
                  onClick={() => handleSpotlightAdjustment(adj.action)}
                  disabled={generatingMode !== null}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
                    adj.action === "generate_ai"
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-300"
                  }`}
                >
                  {adj.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meals Grid Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">
                {activeFilter === "pantry"
                  ? "Use What I Have"
                  : activeFilter === "favorites"
                  ? "Saved Favorites"
                  : activeFilter === "microwave"
                  ? "Microwave Meals"
                  : activeFilter === "assembly"
                  ? "No-Cook Meals"
                  : activeFilter === "one_skillet"
                  ? "Stove, Oven & Appliance Meals"
                  : activeFilter === "healthy_boost"
                  ? "Veggies & Produce"
                  : pantryItems.length > 0
                  ? "Browse Meals (Best Pantry Matches First)"
                  : "Browse Meals"}
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
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      activeFilter === "favorites" ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
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
                  : "No meals match these filters"}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {activeFilter === "pantry" && pantryItems.length === 0
                  ? "Add items to My Pantry to see meals you can make right now."
                  : "Try generating a custom meal with Pick For Me, or adjust your effort/filters above."}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {activeFilter === "pantry" && pantryItems.length === 0 ? (
                  <button
                    onClick={() => setShowPantryModal(true)}
                    className="text-xs font-semibold bg-emerald-700 text-white px-4 py-2 rounded-xl"
                  >
                    Open My Pantry
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleGenerateMeal()}
                      disabled={generatingMode !== null}
                      className="text-xs font-semibold bg-emerald-700 text-white px-4 py-2 rounded-xl"
                    >
                      Generate Custom Meal
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("all");
                        setMealTypeFilter("any");
                        setMaxTimeFilter(null);
                      }}
                      className="text-xs font-semibold bg-stone-100 text-stone-800 px-4 py-2 rounded-xl border border-stone-200"
                    >
                      Clear Browse Filters
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  profile={profile}
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
            Simple Chef · Adaptive meal planning for dorms, busy nights, and full kitchens.
          </p>
          <p className="text-stone-400">
            Inline step measurements · Single-step focus mode · Walmart aisle shopping lists
          </p>
        </div>
      </footer>

      {/* Full-Screen Step-by-Step Focus Mode */}
      {cookingMeal && (
        <CookingFocusMode
          meal={cookingMeal}
          pantryItems={pantryItems}
          profile={profile}
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

      {/* Meal Variety & Comfort Preferences Modal */}
      {showRutModal && (
        <RutManagerModal
          rutMeals={rutMeals}
          varietyPreference={profile.varietyPreference}
          onChangeVarietyPreference={handleChangeVarietyPreference}
          onAddRutMeal={handleAddRutMeal}
          onRemoveRutMeal={handleRemoveRutMeal}
          onClose={() => setShowRutModal(false)}
          onRequestSwap={(comfortFoodName) => {
            handleGenerateMeal(comfortFoodName);
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
          profile={profile}
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
          profile={profile}
          onGenerateOptions={handleRescueIngredients}
          onCookOption={handleCookRescueOption}
          onViewOption={handleViewRescueOption}
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
