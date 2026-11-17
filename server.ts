import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import {
  DistributedRateLimiter,
  buildAdaptiveRecipePrompt,
  deriveRateLimitKey,
  finalizeAndVerifyGeneratedMeal,
  getIngredientBoundsForEffort,
  normalizeGenerationRequest,
  recipeSchema,
} from "./serverLogic";
import { getEffectiveEquipment } from "./src/utils/kitchenProfile";
import { Meal } from "./src/types";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));

const rateLimiter = new DistributedRateLimiter();

async function aiRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const key = deriveRateLimitKey({
    reqIp: req.ip,
    remoteAddress: req.socket.remoteAddress,
  });

  const decision = await rateLimiter.checkAndConsumeAsync(key);
  if (decision.allowed === false && "retryAfterSec" in decision) {
    res.setHeader("Retry-After", String(decision.retryAfterSec));
    return res.status(429).json({
      error: "Taking a breather — try again in a few minutes",
    });
  }

  next();
}

// Claude model used for recipe generation. Override with CLAUDE_MODEL in the environment.
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
// Per-request ceiling for a single recipe generation call.
const GENERATION_TIMEOUT_MS = Number(process.env.GENERATION_TIMEOUT_MS) || 45000;

let anthropicClient: Anthropic | null = null;
const getClaudeClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  anthropicClient ??= new Anthropic({ maxRetries: 1 });
  return anthropicClient;
};

/**
 * Asks Claude for one recipe as JSON constrained to `recipeSchema`.
 * Returns the parsed object, or throws on refusal / truncation / timeout.
 */
async function generateRecipeJson(
  client: Anthropic,
  prompt: string,
  timeoutMs = GENERATION_TIMEOUT_MS
): Promise<Record<string, unknown>> {
  const response = await client.beta.messages.create(
    {
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: recipeSchema },
      },
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: timeoutMs }
  );

  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    throw new Error(`Generation stopped: ${response.stop_reason}`);
  }

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text || "{}") as Record<string, unknown>;
}

function getStylePoolForProfile(
  equipment: string[],
  effort: string
): Array<{ label: string; category: Meal["category"] }> {
  const hasStove = equipment.includes("stove");
  const hasOven = equipment.includes("oven");
  const hasToasterOrAirFryer = equipment.includes("toaster") || equipment.includes("air_fryer");
  const hasFridge = equipment.includes("fridge");

  if (!hasStove && !hasOven) {
    if (!hasFridge) {
      return [
        { label: "shelf-stable microwave rice or chili protein bowl", category: "microwave" },
        { label: "shelf-stable upgraded ramen or noodle bowl cooked in microwave", category: "microwave" },
        { label: "no-cook shelf-stable wrap or peanut butter crunch roll-up", category: "assembly" },
      ];
    }
    if (hasToasterOrAirFryer) {
      return [
        { label: "crispy toasted bagel, flatbread, or English muffin melt", category: "sheet_pan" },
        { label: "air-fryer protein and fresh vegetable bowl", category: "sheet_pan" },
        { label: "quick microwave bowl or loaded quesadilla", category: "microwave" },
        { label: "crisp deli or chicken ranch wrap (no heat needed)", category: "assembly" },
      ];
    }
    return [
      { label: "microwave quesadilla, loaded nachos, or breakfast burrito", category: "microwave" },
      { label: "zero-cook high-protein wrap, roll-up, or deli club bowl", category: "assembly" },
      { label: "hearty microwave rice, chili mac, or spicy ramen bowl", category: "microwave" },
      { label: "loaded baked potato or warm sub melt in the microwave", category: "microwave" },
    ];
  }

  if (effort === "normal" || effort === "moderate") {
    return [
      { label: "savory seared skillet stir-fry, rice bowl, or pan sauce dinner", category: "one_skillet" },
      ...(hasOven
        ? [{ label: "oven-roasted sheet pan protein and fresh vegetables", category: "sheet_pan" as const }]
        : []),
      { label: "homemade hearty pot of chili, simmered pasta, or skillet bake", category: "one_skillet" },
      { label: "cozy homemade comfort skillet or baked dish", category: "comfort" },
    ];
  }

  return [
    { label: "hot sub, quesadilla, or crisp toasted melt", category: "comfort" },
    { label: "1-skillet rice, noodle, or breakfast-for-dinner sauté", category: "one_skillet" },
    ...(hasOven ? [{ label: "easy foil-lined sheet pan dinner", category: "sheet_pan" as const }] : []),
    { label: "no-cook protein wrap, salad kit toss, or yogurt power bowl", category: "assembly" },
    { label: "quick microwave bowl or hot melt", category: "microwave" },
  ];
}

// API: Generate adaptive meal
app.post("/api/generate-meal", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const parsed = normalizeGenerationRequest(body);
    if (parsed.ok === false && "error" in parsed) {
      return res.status(400).json({ error: parsed.error });
    }

    const request = parsed.value;
    const ai = getClaudeClient();
    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable. Using built-in meals.",
      });
    }

    const effectiveEquipment = Array.from(getEffectiveEquipment(request.profile));
    const pool = getStylePoolForProfile(effectiveEquipment, request.profile.effort);
    const pickedStyle = pool[Math.floor(Math.random() * pool.length)];
    const prompt = buildAdaptiveRecipePrompt(request, pickedStyle.label);

    const rawMeal = await generateRecipeJson(ai, prompt);
    const verifiedMeal = finalizeAndVerifyGeneratedMeal(
      rawMeal,
      request.profile,
      request.pantryItems,
      pickedStyle.category
    );

    if (!verifiedMeal) {
      console.error("[/api/generate-meal] AI response failed schema or equipment verification");
      return res.status(502).json({
        error: "Unable to generate a compatible meal right now. Please try again.",
      });
    }

    return res.json({ meal: verifiedMeal });
  } catch (err) {
    console.error(
      "[/api/generate-meal] Generation failure:",
      err instanceof Error ? err.name : "UnknownError"
    );
    return res.status(500).json({
      error: "Unable to generate a meal right now. Please try again.",
    });
  }
});

// API: Turn random ingredients into 3 distinct meal options before cooking
app.post("/api/ingredients-to-meal", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const parsed = normalizeGenerationRequest(body);
    if (!parsed.ok || parsed.value.ingredients.length === 0) {
      return res.status(400).json({
        error: "Invalid request parameters.",
      });
    }

    const request = parsed.value;
    const ai = getClaudeClient();
    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable.",
      });
    }

    const bounds = getIngredientBoundsForEffort(request.profile.effort);
    const effectiveEqSet = getEffectiveEquipment(request.profile);
    const hasStove = effectiveEqSet.has("stove");
    const hasOven = effectiveEqSet.has("oven");
    const hasToasterOrAirFryer =
      effectiveEqSet.has("toaster") || effectiveEqSet.has("air_fryer");

    const hasMicrowave = effectiveEqSet.has("microwave");
    const formatAngles: Array<{ style: string; category: Meal["category"] }> = [
      ...(hasMicrowave
        ? [
            {
              style: "microwave warm bowl, mug scramble, or melted quesadilla",
              category: "microwave" as const,
            },
          ]
        : []),
      {
        style: "zero-cook assembly wrap, plate mash-up, or cold salad toss",
        category: "assembly" as const,
      },
      ...(hasStove
        ? [
            {
              style: "warm 1-skillet stir-fry, melt, or pan sauté",
              category: "one_skillet" as const,
            },
          ]
        : []),
      ...(hasOven || hasToasterOrAirFryer
        ? [
            {
              style: "crisp roasted tray bake or toasted melt",
              category: "sheet_pan" as const,
            },
          ]
        : []),
      ...(hasMicrowave && !hasStove && !hasOven && !hasToasterOrAirFryer
        ? [
            {
              style: "hearty deep-bowl microwave fusion dish",
              category: "microwave" as const,
            },
          ]
        : []),
    ].slice(0, 3);

    const buildRescuePrompt = (style: string) => {
      const base = buildAdaptiveRecipePrompt(request, style);
      return `${base}

INGREDIENT RESCUE FOCUS:
- The user specifically wants to use these ingredients right now: ${request.ingredients.join(", ")}.
- Show them a clear dish title and appetizing 1-sentence tagline BEFORE they commit to cooking.
- Build around those ingredients plus basics/supporting items within ${bounds.min}–${bounds.max} ingredients total.`;
    };

    const fetchOption = async (angle: (typeof formatAngles)[number]) => {
      const rawMeal = await generateRecipeJson(ai, buildRescuePrompt(angle.style));
      return finalizeAndVerifyGeneratedMeal(
        rawMeal,
        request.profile,
        request.ingredients,
        angle.category
      );
    };

    const results = await Promise.allSettled(formatAngles.map((a) => fetchOption(a)));
    const seenTitles = new Set<string>(request.existingTitles.map((t) => t.toLowerCase()));
    const validMeals: Meal[] = [];

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const lower = r.value.title.toLowerCase();
        if (!seenTitles.has(lower)) {
          seenTitles.add(lower);
          validMeals.push(r.value);
        }
      }
    }

    if (validMeals.length === 0) {
      console.error("[/api/ingredients-to-meal] No compatible meal options generated");
      return res.status(502).json({
        error: "Unable to create meal options from those ingredients right now.",
      });
    }

    return res.json({ meals: validMeals, meal: validMeals[0] });
  } catch (err) {
    console.error(
      "[/api/ingredients-to-meal] Rescue error:",
      err instanceof Error ? err.name : "UnknownError"
    );
    return res.status(500).json({
      error: "Unable to create meal options from those ingredients right now.",
    });
  }
});

// API: Suggest fresh meals based on updated pantry items
app.post("/api/pantry-suggestions", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const parsed = normalizeGenerationRequest(body);
    if (!parsed.ok) {
      return res.status(400).json({ error: "Invalid request parameters." });
    }

    const request = {
      ...parsed.value,
      missingPreference: "minimal_missing" as const,
    };

    if (request.pantryItems.length === 0) {
      return res.json({ meals: [] });
    }

    const ai = getClaudeClient();
    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable.",
      });
    }

    const effectiveEquipment = Array.from(getEffectiveEquipment(request.profile));
    const pool = getStylePoolForProfile(effectiveEquipment, request.profile.effort).slice(0, 2);

    const fetchOne = async (angle: (typeof pool)[number]) => {
      const prompt = buildAdaptiveRecipePrompt(request, angle.label);
      const rawMeal = await generateRecipeJson(ai, prompt);
      return finalizeAndVerifyGeneratedMeal(
        rawMeal,
        request.profile,
        request.pantryItems,
        angle.category
      );
    };

    const results = await Promise.allSettled(pool.map((angle) => fetchOne(angle)));
    const seenTitles = new Set<string>(request.existingTitles.map((t) => t.toLowerCase()));
    const validMeals: Meal[] = [];

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const lower = r.value.title.toLowerCase();
        if (!seenTitles.has(lower)) {
          seenTitles.add(lower);
          validMeals.push(r.value);
        }
      }
    }

    return res.json({ meals: validMeals });
  } catch (err) {
    console.error(
      "[/api/pantry-suggestions] Error:",
      err instanceof Error ? err.name : "UnknownError"
    );
    return res.status(500).json({
      error: "Unable to load pantry suggestions right now.",
    });
  }
});

// API: Generate 3 diverse fresh meal ideas at once
app.post("/api/generate-batch", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const parsed = normalizeGenerationRequest(body);
    if (!parsed.ok) {
      return res.status(400).json({ error: "Invalid request parameters." });
    }

    const request = parsed.value;
    const ai = getClaudeClient();
    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable.",
      });
    }

    const effectiveEquipment = Array.from(getEffectiveEquipment(request.profile));
    const pool = getStylePoolForProfile(effectiveEquipment, request.profile.effort);
    const chosenAngles = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);

    const fetchOne = async (angle: (typeof chosenAngles)[number]) => {
      const prompt = buildAdaptiveRecipePrompt(request, angle.label);
      const rawMeal = await generateRecipeJson(ai, prompt);
      return finalizeAndVerifyGeneratedMeal(
        rawMeal,
        request.profile,
        request.pantryItems,
        angle.category
      );
    };

    const results = await Promise.allSettled(chosenAngles.map((a) => fetchOne(a)));
    const seenTitles = new Set<string>(request.existingTitles.map((t) => t.toLowerCase()));
    const validMeals: Meal[] = [];

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const lower = r.value.title.toLowerCase();
        if (!seenTitles.has(lower)) {
          seenTitles.add(lower);
          validMeals.push(r.value);
        }
      }
    }

    return res.json({ meals: validMeals });
  } catch (err) {
    console.error(
      "[/api/generate-batch] Error:",
      err instanceof Error ? err.name : "UnknownError"
    );
    return res.status(500).json({
      error: "Unable to generate meal ideas right now. Please try again.",
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    model: CLAUDE_MODEL,
  });
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const disableHmr = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: disableHmr ? false : { server: httpServer },
      },
      appType: "spa",
    });
    if (disableHmr) {
      app.get("/@vite/client", async (_req, res, next) => {
        try {
          const result = await vite.transformRequest("/@vite/client");
          if (result?.code) {
            const patched = result.code
              .replace(
                "let isConnected = !invokeableTransport.connect;",
                "let isConnected = true;"
              )
              .replace(
                "ws.send(JSON.stringify(data));",
                "ws?.send(JSON.stringify(data));"
              )
              .replace(
                "transport.connect(createHMRHandler(handleMessage));",
                "/* HMR disabled */"
              );
            res.setHeader("Content-Type", "application/javascript");
            res.send(patched);
            return;
          }
        } catch {
          // Fall through to default Vite middleware
        }
        next();
      });
    }
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
