import { GroceryItem, Meal, PantryItem, RutMeal } from "../types";

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(0, Math.min(999, Math.round(qty)));
}

/**
 * 3-way merge for PantryItem[] against the last synchronized baseline.
 * Prevents offline or concurrent multi-device household edits from silently overwriting each other.
 */
export function mergePantryState(
  baseline: PantryItem[],
  local: PantryItem[],
  remote: PantryItem[]
): PantryItem[] {
  const baseMap = new Map<string, PantryItem>();
  const localMap = new Map<string, PantryItem>();
  const remoteMap = new Map<string, PantryItem>();

  for (const item of baseline) {
    baseMap.set(item.name.toLowerCase(), { name: item.name, quantity: clampQty(item.quantity) });
  }
  for (const item of local) {
    localMap.set(item.name.toLowerCase(), { name: item.name, quantity: clampQty(item.quantity) });
  }
  for (const item of remote) {
    remoteMap.set(item.name.toLowerCase(), { name: item.name, quantity: clampQty(item.quantity) });
  }

  const allKeys = new Set<string>([
    ...localMap.keys(),
    ...remoteMap.keys(),
    ...baseMap.keys(),
  ]);

  const result: PantryItem[] = [];
  for (const key of allKeys) {
    const b = baseMap.get(key);
    const l = localMap.get(key);
    const r = remoteMap.get(key);

    if (l && r) {
      if (b) {
        // Combine deltas cleanly if both modified since baseline
        const mergedQty = clampQty(b.quantity + (l.quantity - b.quantity) + (r.quantity - b.quantity));
        if (mergedQty > 0) {
          result.push({ name: l.name, quantity: mergedQty });
        }
      } else {
        // Added concurrently on both sides -> avoid doubling identical pantry item; keep max quantity
        const mergedQty = clampQty(Math.max(l.quantity, r.quantity));
        if (mergedQty > 0) {
          result.push({ name: l.name, quantity: mergedQty });
        }
      }
    } else if (l && !r) {
      if (!b) {
        // Added locally while offline/concurrently -> preserve!
        if (l.quantity > 0) result.push(l);
      } else if (l.quantity !== b.quantity) {
        // Remote removed it, but local modified quantity -> keep local edit
        if (l.quantity > 0) result.push(l);
      }
      // Otherwise remote deleted an item unchanged locally -> honor remote delete
    } else if (!l && r) {
      if (!b) {
        // Added remotely -> pull in!
        if (r.quantity > 0) result.push(r);
      } else if (r.quantity !== b.quantity) {
        // Local deleted it, but remote modified quantity -> keep remote update
        if (r.quantity > 0) result.push(r);
      }
      // Otherwise local deleted an item unchanged remotely -> honor local delete
    }
  }

  return result.slice(0, 150);
}

/**
 * 3-way merge for GroceryItem[] keyed by item.id.
 * Preserves concurrent offline additions and completion toggles across roommates.
 */
export function mergeGroceryState(
  baseline: GroceryItem[],
  local: GroceryItem[],
  remote: GroceryItem[]
): GroceryItem[] {
  const baseMap = new Map<string, GroceryItem>();
  const localMap = new Map<string, GroceryItem>();
  const remoteMap = new Map<string, GroceryItem>();

  for (const item of baseline) baseMap.set(item.id, item);
  for (const item of local) localMap.set(item.id, item);
  for (const item of remote) remoteMap.set(item.id, item);

  const merged: GroceryItem[] = [];
  const seen = new Set<string>();

  // Walk remote order first, then append newly added local-only items
  const orderedIds = [
    ...remote.map((i) => i.id),
    ...local.map((i) => i.id),
  ];

  for (const id of orderedIds) {
    if (seen.has(id)) continue;
    seen.add(id);

    const b = baseMap.get(id);
    const l = localMap.get(id);
    const r = remoteMap.get(id);

    if (l && r) {
      if (b) {
        const completed =
          l.completed !== b.completed && r.completed === b.completed
            ? l.completed
            : r.completed !== b.completed && l.completed === b.completed
            ? r.completed
            : r.completed || l.completed;
        merged.push({ ...r, completed });
      } else {
        merged.push({ ...r, completed: r.completed || l.completed });
      }
    } else if (l && !r) {
      if (!b) {
        merged.push(l);
      } else if (l.completed !== b.completed) {
        merged.push(l);
      }
    } else if (!l && r) {
      if (!b) {
        merged.push(r);
      } else if (r.completed !== b.completed) {
        merged.push(r);
      }
    }
  }

  return merged.slice(0, 200);
}

/**
 * Merges offline local device edits safely with remote cloud state upon initial sign-in
 * so items added while signed out or offline are never silently wiped.
 */
export function mergeOnSignInOfflineToCloud(params: {
  localPantry: PantryItem[];
  remotePantry: PantryItem[];
  localGrocery: GroceryItem[];
  remoteGrocery: GroceryItem[];
  localFavorites: string[];
  remoteFavorites: string[];
  localCustomMeals: Meal[];
  remoteCustomMeals: Meal[];
  localRutMeals: RutMeal[];
  remoteRutMeals: RutMeal[];
}): {
  pantryItems: PantryItem[];
  groceryItems: GroceryItem[];
  favorites: string[];
  customMeals: Meal[];
  rutMeals: RutMeal[];
} {
  // Union pantry items without duplicating quantities of identical names
  const pantryItems = mergePantryState([], params.localPantry, params.remotePantry);

  // Union grocery items by ID + semantic key (name + mealTitle) to avoid duplicate identical items
  const groceryMap = new Map<string, GroceryItem>();
  const semanticKeys = new Set<string>();
  for (const r of params.remoteGrocery) {
    groceryMap.set(r.id, r);
    semanticKeys.add(`${r.name.toLowerCase()}::${r.mealTitle.toLowerCase()}`);
  }
  for (const l of params.localGrocery) {
    const sem = `${l.name.toLowerCase()}::${l.mealTitle.toLowerCase()}`;
    if (!groceryMap.has(l.id) && !semanticKeys.has(sem)) {
      groceryMap.set(l.id, l);
      semanticKeys.add(sem);
    }
  }

  const favSet = new Set<string>([...params.remoteFavorites, ...params.localFavorites]);

  const mealMap = new Map<string, Meal>();
  for (const m of params.remoteCustomMeals) mealMap.set(m.id, m);
  for (const m of params.localCustomMeals) {
    if (!mealMap.has(m.id)) mealMap.set(m.id, m);
  }

  const rutMap = new Map<string, RutMeal>();
  for (const r of params.remoteRutMeals) rutMap.set(r.name.toLowerCase(), r);
  for (const r of params.localRutMeals) {
    if (!rutMap.has(r.name.toLowerCase())) rutMap.set(r.name.toLowerCase(), r);
  }

  return {
    pantryItems,
    groceryItems: Array.from(groceryMap.values()).slice(0, 200),
    favorites: Array.from(favSet).slice(0, 200),
    customMeals: Array.from(mealMap.values()).slice(0, 100),
    rutMeals: Array.from(rutMap.values()).slice(0, 100),
  };
}
