@AGENTS.md

# Dev notes
- Stack: React 19 + Vite + Tailwind (client, `src/`), Express server (`server.ts`, logic in `serverLogic.ts`), Firebase Auth/Firestore for sync.
- AI: Gemini API free tier via `@google/genai` (`GEMINI_API_KEY`); recipes come back as JSON constrained by `recipeSchema` and are then verified by `finalizeAndVerifyGeneratedMeal`.
- Commands: `npm run dev` (server + Vite on :3000), `npm run lint` (tsc), `npm test` (vitest), `npm run build`.
- Deploy: Firebase App Hosting (`apphosting.yaml`); `GEMINI_API_KEY` is a Secret Manager secret.
