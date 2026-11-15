import { describe, it, expect } from "vitest";
import {
  mergeGroceryState,
  mergeOnSignInOfflineToCloud,
  mergePantryState,
} from "../src/utils/syncMerge";
import {
  sanitizeCustomMealsForCloud,
  sanitizeGroceryForCloud,
  sanitizePantryForCloud,
  sanitizeRutForCloud,
} from "../src/firebase";
import { GroceryItem, PantryItem } from "../src/types";

describe("Offline Sync Merge & Client Cloud Sanitization", () => {
  it("preserves concurrent roommate pantry additions and quantity deltas via 3-way merge", () => {
    const baseline: PantryItem[] = [
      { name: "Eggs", quantity: 6 },
      { name: "Tortillas", quantity: 1 },
    ];
    const localOffline: PantryItem[] = [
      { name: "Eggs", quantity: 4 }, // local cooked 2 eggs (-2 delta)
      { name: "Tortillas", quantity: 1 },
      { name: "Salsa", quantity: 1 }, // added offline locally
    ];
    const remoteRoommate: PantryItem[] = [
      { name: "Eggs", quantity: 8 }, // roommate bought +2 (+2 delta)
      { name: "Tortillas", quantity: 1 },
      { name: "Black beans", quantity: 2 }, // roommate added remotely
    ];

    const merged = mergePantryState(baseline, localOffline, remoteRoommate);
    const map = new Map(merged.map((i) => [i.name, i.quantity]));

    expect(map.get("Eggs")).toBe(6); // 6 - 2 + 2 = 6
    expect(map.get("Salsa")).toBe(1);
    expect(map.get("Black beans")).toBe(2);
  });

  it("merges offline grocery additions and completion toggles without losing items", () => {
    const baseline: GroceryItem[] = [
      { id: "g1", name: "Rice", amount: "1 pouch", aisle: "Pantry / Canned", mealTitle: "Bowl", completed: false },
    ];
    const local: GroceryItem[] = [
      { id: "g1", name: "Rice", amount: "1 pouch", aisle: "Pantry / Canned", mealTitle: "Bowl", completed: true },
      { id: "g2", name: "Chips", amount: "1 bag", aisle: "Pantry / Canned", mealTitle: "Nachos", completed: false },
    ];
    const remote: GroceryItem[] = [
      { id: "g1", name: "Rice", amount: "1 pouch", aisle: "Pantry / Canned", mealTitle: "Bowl", completed: false },
      { id: "g3", name: "Cheese", amount: "1 bag", aisle: "Dairy & Eggs", mealTitle: "Nachos", completed: false },
    ];

    const merged = mergeGroceryState(baseline, local, remote);
    expect(merged.map((i) => i.id)).toEqual(["g1", "g3", "g2"]);
    expect(merged.find((i) => i.id === "g1")?.completed).toBe(true);
  });

  it("merges signed-out offline data safely into cloud state on initial sign-in", () => {
    const res = mergeOnSignInOfflineToCloud({
      localPantry: [{ name: "Peanut butter", quantity: 1 }, { name: "Salsa", quantity: 2 }],
      remotePantry: [{ name: "Salsa", quantity: 1 }, { name: "Tortillas", quantity: 1 }],
      localGrocery: [{ id: "l1", name: "Bananas", amount: "1 bunch", aisle: "Produce", mealTitle: "Wrap", completed: false }],
      remoteGrocery: [{ id: "r1", name: "Salsa", amount: "1 jar", aisle: "Pantry / Canned", mealTitle: "Bowl", completed: false }],
      localFavorites: ["meal-a"],
      remoteFavorites: ["meal-b"],
      localCustomMeals: [],
      remoteCustomMeals: [],
      localRutMeals: [],
      remoteRutMeals: [],
    });

    expect(res.pantryItems.find((i) => i.name === "Peanut butter")?.quantity).toBe(1);
    expect(res.pantryItems.find((i) => i.name === "Salsa")?.quantity).toBe(2);
    expect(res.groceryItems).toHaveLength(2);
    expect(res.favorites).toEqual(["meal-b", "meal-a"]);
  });

  it("skips corrupted/poisoned list items safely without crashing when sanitizing", () => {
    const dirtyPantry = [
      { name: "Oats", quantity: 2 },
      { name: "", quantity: 3 },
      "bad-string",
      { name: "Cheese", quantity: -9 },
      null,
    ];
    expect(sanitizePantryForCloud(dirtyPantry)).toEqual([{ name: "Oats", quantity: 2 }]);

    const dirtyGrocery = [
      { id: "ok1", name: "Milk", amount: "1 gal", aisle: "Dairy & Eggs", mealTitle: "Cereal", completed: false },
      { id: 123, name: "Bad", completed: "nope" },
    ];
    expect(sanitizeGroceryForCloud(dirtyGrocery)).toHaveLength(1);

    expect(
      sanitizeRutForCloud([
        { id: "r1", name: "Ramen", dateAdded: "2026-01-01" },
        { id: "", name: 42 },
      ])
    ).toHaveLength(1);

    expect(
      sanitizeCustomMealsForCloud([
        null,
        { id: "bad", title: "Incomplete" },
      ])
    ).toEqual([]);
  });
});
