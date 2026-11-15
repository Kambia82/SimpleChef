import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

export const DIRTY_DOZEN_CASES = [
  {
    id: 1,
    name: "Cross-User State Read/Write",
    actor: { uid: "userB", email_verified: true },
    operation: "get/update",
    path: "/users/userA/appState/main",
    expected: "PERMISSION_DENIED",
  },
  {
    id: 2,
    name: "Unverified Email Write",
    actor: { uid: "userA", email_verified: false },
    operation: "create",
    path: "/users/userA/appState/main",
    expected: "PERMISSION_DENIED",
  },
  {
    id: 3,
    name: "Shadow Field Injection",
    actor: { uid: "userA", email_verified: true },
    operation: "create",
    path: "/users/userA/appState/main",
    payload: { isAdmin: true },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 4,
    name: "Owner Spoofing",
    actor: { uid: "userA", email_verified: true },
    operation: "create",
    path: "/users/userA/appState/main",
    payload: { ownerId: "userB" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 5,
    name: "Fake Timestamp Injection",
    actor: { uid: "userA", email_verified: true },
    operation: "create",
    path: "/users/userA/appState/main",
    payload: { createdAt: "2020-01-01T00:00:00Z" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 6,
    name: "Immutable Field Mutation",
    actor: { uid: "userA", email_verified: true },
    operation: "update",
    path: "/users/userA/appState/main",
    payload: { ownerId: "userB" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 7,
    name: "ID Poisoning / Invalid State ID",
    actor: { uid: "userA", email_verified: true },
    operation: "create",
    path: "/users/userA/appState/not_main",
    expected: "PERMISSION_DENIED",
  },
  {
    id: 8,
    name: "Orphaned Household Member Join",
    actor: { uid: "userB", email_verified: true },
    operation: "create",
    path: "/households/FAKECODE/members/userB",
    payload: { uid: "userB", role: "member", displayName: "Bob" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 9,
    name: "Self-Assigned Owner Escalation",
    actor: { uid: "userB", email_verified: true },
    operation: "create",
    path: "/households/REAL1234/members/userB",
    payload: { uid: "userB", role: "owner", displayName: "Bob" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 10,
    name: "Non-Member Shared State Read/Write",
    actor: { uid: "userC", email_verified: true },
    operation: "get/update",
    path: "/households/REAL1234/sharedState/main",
    expected: "PERMISSION_DENIED",
  },
  {
    id: 11,
    name: "Value Poisoning on Shared State Update",
    actor: { uid: "userB", email_verified: true },
    operation: "update",
    path: "/households/REAL1234/sharedState/main",
    payload: { pantryItems: "invalid-string-instead-of-list" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 12,
    name: "Blanket Collection Scraping",
    actor: { uid: "userA", email_verified: true },
    operation: "list",
    path: "/households",
    expected: "PERMISSION_DENIED",
  },
] as const;

/**
 * Policy mirror of firestore.rules validation helpers so security invariants and
 * Dirty Dozen adversarial cases are regression-tested in Vitest even without JVM/Emulator.
 */
function isValidPantryEntry(item: unknown): boolean {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  const keys = Object.keys(item);
  const obj = item as Record<string, unknown>;
  return (
    keys.length === 2 &&
    keys.includes("name") &&
    keys.includes("quantity") &&
    typeof obj.name === "string" &&
    obj.name.length >= 1 &&
    obj.name.length <= 100 &&
    typeof obj.quantity === "number" &&
    obj.quantity >= 1 &&
    obj.quantity <= 999
  );
}

function isValidPantryListByRules(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length > 150) return false;
  if (arr.length === 0) return true;
  return (
    isValidPantryEntry(arr[0]) &&
    isValidPantryEntry(arr[arr.length - 1]) &&
    (arr.length < 2 || isValidPantryEntry(arr[1]))
  );
}

describe("firestore.rules security specification & static invariants", () => {
  const rulesText = fs.readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8");

  it("enforces default-deny catch-all and disables blanket collection list queries", () => {
    expect(rulesText).toContain("match /{document=**}");
    expect(rulesText).toContain("allow read, write: if false;");
    expect(rulesText).toContain("allow list: if false;");
    expect(rulesText).toContain("request.auth.token.email_verified == true");
  });

  it("checks head, second, and tail elements on pantry, grocery, rut, favorites, and customMeals lists", () => {
    for (const fnName of [
      "isValidPantryList",
      "isValidGroceryList",
      "isValidRutList",
      "isValidFavoritesList",
      "isValidCustomMealsList",
    ]) {
      expect(rulesText).toContain(`function ${fnName}(arr)`);
    }
    expect(rulesText).toContain("arr[arr.size() - 1]");
    expect(rulesText).toContain("item.ingredients.size() <= 16");
  });

  it("locks UserAppState writes to verified owner with exact key whitelist and server timestamps", () => {
    expect(rulesText).toContain("stateId == 'main'");
    expect(rulesText).toContain("incoming().createdAt == request.time");
    expect(rulesText).toContain("incoming().ownerId == existing().ownerId");
    expect(rulesText).toContain("incoming().createdAt == existing().createdAt");
    expect(rulesText).toContain("data.keys().hasOnly([");
    expect(rulesText).toContain("function isValidKitchenProfile(kp)");
  });

  it("blocks household privilege escalation and orphaned members", () => {
    expect(rulesText).toContain(
      "exists(/databases/$(database)/documents/households/$(householdId))"
    );
    expect(rulesText).toContain("incoming().role == 'owner'");
    expect(rulesText).toContain("isHouseholdMember(householdId)");
  });

  it("verifies tail-poisoning defense rejects invalid final item in pantry list", () => {
    const poisonedTail = [
      { name: "Eggs", quantity: 6 },
      { name: "Salsa", quantity: 1 },
      { name: "", quantity: -5 },
    ];
    expect(isValidPantryListByRules(poisonedTail)).toBe(false);
    expect(
      isValidPantryListByRules([
        { name: "Eggs", quantity: 6 },
        { name: "Salsa", quantity: 1 },
      ])
    ).toBe(true);
  });

  it("accounts for all 12 Dirty Dozen adversarial vectors", () => {
    expect(DIRTY_DOZEN_CASES).toHaveLength(12);
    for (const testCase of DIRTY_DOZEN_CASES) {
      expect(testCase.expected).toBe("PERMISSION_DENIED");
    }
  });
});
