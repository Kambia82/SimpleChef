# Security Specification: Simple Chef (Easy Low-Effort Meals)

## 1. Data Invariants
1. **Default Isolation**: Unauthenticated or distinct signed-in users never share data. Every user's private state lives at `/users/{userId}/appState/main`, readable and writable only by `userId` with a verified email.
2. **Master Gate for Households**: Access to `/households/{householdId}` and `/households/{householdId}/sharedState/main` requires a corresponding membership document at `/households/{householdId}/members/{request.auth.uid}`. Leaving or removing membership revokes access synchronously.
3. **No Orphaned Memberships or Spoofed Owners**: Creating a household member requires the parent `/households/{householdId}` document to exist (or be created in the same atomic batch for the owner). `ownerId` and `createdAt` are immutable after creation.
4. **Strict Keys & Bounded Sizes**: All documents enforce `keys().hasAll(...) && keys().hasOnly(...)` on creation, action-specific `affectedKeys().hasOnly(...)` on update, string/array size limits, regex-checked IDs, and server-verified `request.time` timestamps.
5. **No Blanket List or PII Exposure**: Collection `list` queries are disabled across all collections (`allow list: if false;`), and no user emails or private PII are stored in shared household documents.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Cross-User State Read/Write**: User B attempts to `get` or `update` `/users/userA/appState/main` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to `create` `/users/userA/appState/main` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection (UserAppState)**: User A creates `/users/userA/appState/main` with an extra ghost key `isAdmin: true` -> `PERMISSION_DENIED`.
4. **Owner Spoofing**: User A creates `/users/userA/appState/main` with `ownerId: "userB"` -> `PERMISSION_DENIED`.
5. **Fake Timestamp Injection**: User A creates `/users/userA/appState/main` with client-forged `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
6. **Immutable Field Mutation**: User A updates `/users/userA/appState/main` modifying `ownerId` or `createdAt` -> `PERMISSION_DENIED`.
7. **ID Poisoning**: User A attempts to write `/users/userA/appState/invalid..id` or oversized `householdId` (`> 32` chars) -> `PERMISSION_DENIED`.
8. **Invalid Household Code Join (Orphaned Member)**: User B attempts to create `/households/FAKECODE99/members/userB` when `/households/FAKECODE99` does not exist -> `PERMISSION_DENIED`.
9. **Self-Assigned Owner Escalation**: Non-owner User B attempts to join an existing household by setting `role: "owner"` in `/households/ABCD1234/members/userB` -> `PERMISSION_DENIED`.
10. **Non-Member Shared State Read/Write**: User C (not in `/households/ABCD1234/members`) attempts to `get` or `update` `/households/ABCD1234/sharedState/main` -> `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: Household member updates `/households/ABCD1234/sharedState/main` with `pantryItems` exceeding the array size cap (`> 150`) or wrong type (`pantryItems: "not-a-list"`) -> `PERMISSION_DENIED`.
12. **Blanket Collection Scraping**: Any signed-in user attempts to `list` `/households` or `/users/userA/appState` -> `PERMISSION_DENIED`.
