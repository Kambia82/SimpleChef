@AGENTS.md

# Dev notes
- Stack: React 19 + Vite + Tailwind (client, `src/`), Express server (`server.ts`, logic in `serverLogic.ts`), Firebase Auth/Firestore for sync.
- AI: Claude API via `@anthropic-ai/sdk`; recipes come back as JSON constrained by `recipeSchema` (structured outputs) and are then verified by `finalizeAndVerifyGeneratedMeal`.
- Commands: `npm run dev` (server + Vite on :3000), `npm run lint` (tsc), `npm test` (vitest), `npm run build`.
- Deploy: Firebase App Hosting (`apphosting.yaml`); `ANTHROPIC_API_KEY` is a Secret Manager secret.
