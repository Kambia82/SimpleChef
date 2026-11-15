import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));

// Rate limiter: max 20 requests per 10 minutes per IP across AI endpoints
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitStore = new Map<string, number[]>();

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

function aiRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const ip = getClientIp(req);

  const recent = (rateLimitStore.get(ip) || []).filter((ts) => ts > windowStart);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: "Taking a breather — try again in a few minutes",
    });
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);

  // Opportunistic cleanup so stale IPs don't accumulate
  if (rateLimitStore.size > 1000) {
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const active = timestamps.filter((ts) => ts > windowStart);
      if (active.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, active);
      }
    }
  }

  next();
}

const MAX_ARRAY_ITEMS = 25;
const MAX_ITEM_CHARS = 100;

function validateStringArrayInput(
  raw: unknown
): { ok: true; items: string[] } | { ok: false } {
  if (raw === undefined) {
    return { ok: true, items: [] };
  }
  if (!Array.isArray(raw)) {
    return { ok: false };
  }
  for (const entry of raw) {
    if (typeof entry !== "string") {
      return { ok: false };
    }
  }
  const sanitized = raw
    .slice(0, MAX_ARRAY_ITEMS)
    .map((s) => s.trim().slice(0, MAX_ITEM_CHARS))
    .filter((s) => s.length > 0);
  return { ok: true, items: sanitized };
}

function parseKitchenConstraints(body: Record<string, unknown>): {
  kitchenMode: "microwave_only" | "full_kitchen";
  noFreezer: boolean;
  hardwarePromptRule: string;
} {
  const kitchenMode =
    body.kitchenMode === "full_kitchen" ? "full_kitchen" : "microwave_only";
  const noFreezer = body.noFreezer === true;

  const parts: string[] = [];
  if (kitchenMode === "microwave_only") {
    parts.push(
      "STRICT DORM / MICROWAVE-ONLY HARDWARE RULE: The user ONLY has access to a shared microwave (and possibly a mini-fridge). They DO NOT have a stove, stovetop, skillet, pot, oven, toaster oven, toaster, air fryer, hot plate, or electric kettle. Every single step MUST require either zero heat (no-cook assembly) OR only a microwave using a mug, plate, or deep microwave-safe bowl (boil ramen/macaroni right inside a deep microwave-safe bowl of water if needed — NEVER tell them to use a skillet, stove, oven, toaster, kettle, or hot plate)."
    );
    parts.push(
      "AUDIENCE & TASTE PROFILE (19-YEAR-OLD COLLEGE GUY): Suggest hearty, high-protein, genuinely craveable college dorm meals he will actually want to buy ingredients for and eat — such as buffalo chicken ranch wraps, pepperoni pizza quesadillas, cheesy bacon & egg breakfast burritos, loaded chicken nachos, BBQ chicken subs, teriyaki chicken rice bowls, meatball marinara subs, turkey bacon club wraps, chili cheese mac, or cheesy egg & chicken ramen. Avoid fussy wellness-blog meals like sweet potato bowls, chickpea bowls, hummus-carrot plates, or tzatziki pitas unless the user specifically asks for them."
    );
  }
  if (noFreezer) {
    parts.push(
      "NO FREEZER AVAILABLE: Do NOT include any frozen foods (no frozen veggies, frozen meatballs, frozen shrimp, frozen berries, etc.). Stick strictly to shelf-stable pantry items and refrigerated mini-fridge staples."
    );
  }

  return {
    kitchenMode,
    noFreezer,
    hardwarePromptRule: parts.join("\n"),
  };
}


// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Clear, friendly name of the meal" },
    tagline: { type: Type.STRING, description: "One punchy sentence explaining why it is dead-simple" },
    prepMinutes: { type: Type.INTEGER, description: "Minutes to prep (keep under 10)" },
    cookMinutes: { type: Type.INTEGER, description: "Minutes to cook or heat" },
    ingredients: {
      type: Type.ARRAY,
      description: "List of 3 to 5 simple ingredients easily purchased at Walmart",
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Ingredient name e.g. Pre-cooked rotisserie chicken breast" },
          amount: { type: Type.STRING, description: "Practical amount e.g. 1 cup or 1 can" },
          walmartAisle: {
            type: Type.STRING,
            description: "Aisle category: Produce, Meat & Deli, Dairy & Eggs, Pantry / Canned, Frozen, or Bakery",
          },
          tip: { type: Type.STRING, description: "Optional shortcut tip e.g. Buy pre-shredded" },
        },
        required: ["item", "amount", "walmartAisle"],
      },
    },
    instructions: {
      type: Type.ARRAY,
      description: "3 to 4 sequential, low-cognitive-load steps. Each step MUST explicitly mention the ingredients and amounts used so the cook never has to flip back and forth.",
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING, description: "Short 2-4 word bold action e.g. Microwave Rice & Beans" },
          instruction: {
            type: Type.STRING,
            description: "Clear, plain English directions. State exact amounts and what to do simply.",
          },
          timerSeconds: { type: Type.INTEGER, description: "Optional seconds for timer if cooking/heating (e.g. 90 or 300)" },
        },
        required: ["stepNumber", "title", "instruction"],
      },
    },
    whyItWorks: {
      type: Type.STRING,
      description: "Brief reassuring explanation of why this satisfies cravings and provides good fuel without effort",
    },
    rutAlternativeNote: {
      type: Type.STRING,
      description: "How this specifically prevents them from falling back into their usual rut",
    },
    optionalAddons: {
      type: Type.ARRAY,
      description: "2 simple, optional 1-item additions if the cook wants to take the dish a step further",
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Optional add-on ingredient e.g. Sliced jalapeños or garlic butter" },
          howToUse: { type: Type.STRING, description: "Short 1-sentence instruction on how to add it" },
          walmartAisle: {
            type: Type.STRING,
            description: "Produce, Meat & Deli, Dairy & Eggs, Pantry / Canned, Frozen, Bakery, or Spices & Condiments",
          },
        },
        required: ["item", "howToUse", "walmartAisle"],
      },
    },
    sidePairings: {
      type: Type.ARRAY,
      description: "2 zero-effort Walmart side item pairings that go well with this meal (e.g. bagged salad kit, baby carrots, fruit cup)",
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Easy side item name" },
          howToUse: { type: Type.STRING, description: "Short 1-sentence note on serving it with zero fuss" },
          walmartAisle: {
            type: Type.STRING,
            description: "Produce, Meat & Deli, Dairy & Eggs, Pantry / Canned, Frozen, Bakery, or Spices & Condiments",
          },
        },
        required: ["item", "howToUse", "walmartAisle"],
      },
    },
  },
  required: ["title", "tagline", "prepMinutes", "cookMinutes", "ingredients", "instructions", "whyItWorks", "rutAlternativeNote", "optionalAddons", "sidePairings"],
};

// API: Generate low-effort meal
app.post("/api/generate-meal", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const rutParsed = validateStringArrayInput(body.rutMeals);
    const existingParsed = validateStringArrayInput(body.existingTitles);
    const pantryParsed = validateStringArrayInput(body.pantryItems);

    if (!rutParsed.ok || !existingParsed.ok || !pantryParsed.ok) {
      return res.status(400).json({
        error: "Invalid request parameters.",
      });
    }

    const rutMeals = rutParsed.items;
    const existingTitles = existingParsed.items;
    const pantryItems = pantryParsed.items;
    const energyLevel =
      typeof body.energyLevel === "string"
        ? body.energyLevel.trim().slice(0, 60) || "super_low"
        : "super_low";
    const mood =
      typeof body.mood === "string"
        ? body.mood.trim().slice(0, 40) || "quick"
        : "quick";
    const timeLimit =
      typeof body.timeLimit === "number" && Number.isFinite(body.timeLimit)
        ? Math.max(3, Math.min(60, Math.round(body.timeLimit)))
        : 15;
    const { kitchenMode, noFreezer, hardwarePromptRule } = parseKitchenConstraints(body);

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable. Using pre-loaded low-effort meals.",
      });
    }

    const rutText = rutMeals.length > 0
      ? `The user wants to avoid these rut meals: ${rutMeals.join(", ")}. DO NOT suggest any of these or close duplicates.`
      : "Suggest a balanced, satisfying easy meal.";

    const existingText = existingTitles.length > 0
      ? `DO NOT repeat or closely duplicate ANY of these existing meals: ${existingTitles.join(", ")}.`
      : "";

    const pantryText = pantryItems.length > 0
      ? `The user happens to have these items on hand (feel free to use 1-3 of them OR introduce fresh easy Walmart items for variety): ${pantryItems.join(", ")}.`
      : noFreezer
      ? "Feel free to use varied everyday Walmart shelf-stable pantry or mini-fridge staples (pre-cooked chicken strips, tear-open chicken/tuna pouches, 90-second rice pouches, tortillas, pepperoni, pre-cooked bacon, canned beef chili/black beans, shredded cheddar/mozzarella, eggs, buffalo/BBQ/teriyaki sauce, tortilla chips, etc. — NO frozen items)."
      : kitchenMode === "microwave_only"
      ? "Feel free to use varied everyday Walmart dorm favorites (90-second rice pouches, pre-cooked chicken strips, tear-open chicken/tuna pouches, tortillas, pepperoni, pre-cooked bacon, canned beef chili, shredded cheese, eggs, steam-in-bag frozen broccoli, frozen meatballs/chicken tenders, ramen, mac cups, etc.)."
      : "Not every household keeps the same pantry items—feel free to use varied everyday Walmart fridge, freezer, or shelf staples (such as frozen meatballs, rotisserie chicken, pre-cooked bacon, ground beef, ramen, eggs, frozen veggies, pasta, deli turkey, rice, etc.).";

    const dormStyles: Array<{ label: string; category: "microwave" | "assembly" }> = [
      { label: "3-minute microwave quesadilla, loaded nachos, or breakfast burrito (pepperoni pizza quesadilla, chicken quesadilla, or bacon egg burrito)", category: "microwave" },
      { label: "zero-cook high-protein deli wrap or sub (buffalo chicken ranch wrap, turkey bacon club wrap, or crispy tender wrap)", category: "assembly" },
      { label: "4-5 minute hearty microwave rice, chili mac, or ramen bowl in one deep bowl (teriyaki chicken rice, chili cheese mac, or cheesy egg ramen)", category: "microwave" },
      { label: "3-5 minute microwave hot sub or melt (BBQ pulled chicken sub, meatball mozzarella sub, or cheesy melt on bread/buns)", category: "microwave" },
    ];
    const fullKitchenStyles: Array<{ label: string; category: "microwave" | "assembly" | "one_skillet" | "sheet_pan" | "comfort" }> = [
      { label: "hot sub, melt, quesadilla, or toasted sandwich", category: "comfort" },
      { label: "quick teriyaki, sesame noodle, or chicken rice bowl", category: "one_skillet" },
      { label: "savory 1-skillet or sheet-pan sausage/chicken/beef dinner", category: "one_skillet" },
      { label: "hearty buffalo chicken, Caesar, or deli club wrap", category: "assembly" },
      { label: "breakfast-for-dinner bacon, egg, hashbrown, or burrito skillet", category: "one_skillet" },
      { label: "freezer-shortcut chicken tender, meatball, or potsticker dinner", category: "microwave" },
    ];
    const pool = kitchenMode === "microwave_only" ? dormStyles : fullKitchenStyles;
    const pickedStyle = pool[Math.floor(Math.random() * pool.length)];

    const prompt = `
You are an empathetic, practical meal assistant for someone with low working memory, executive dysfunction, or mental exhaustion.
The user needs a meal that does the 'brain work' for them.
CRITICAL RULES:
1. NO MORE THAN 3 TO 5 INGREDIENTS TOTAL.
2. Standard, everyday items easily bought at Walmart.
3. The instructions MUST have 3 to 4 steps maximum.
4. INSTRUCTION RULE: The cook CANNOT keep looking back and forth between ingredient lists and instructions. So each step MUST state the ingredient and amount right in the sentence (e.g. "Dump 1 can of rinsed black beans and 1/2 cup of mild salsa into a microwave-safe bowl").
5. Style direction for variety: "${pickedStyle.label}". Effort level requested: "${energyLevel}" (Time limit: max ${timeLimit} minutes, Mood: ${mood}).
6. ${rutText}
7. ${existingText}
8. ${pantryText}
9. Include real protein, fiber, or easy veggies while staying super satisfying and effortless.
${hardwarePromptRule ? `10. ${hardwarePromptRule}` : ""}

Generate one fresh, distinct meal matching these strict cognitive-load and hardware constraints.
`;

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: recipeSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Meal generation timed out")), 15000)
      ),
    ]);

    const mealData = JSON.parse(response.text || "{}");
    if (!mealData?.title || !Array.isArray(mealData?.instructions)) {
      console.error("[/api/generate-meal] Incomplete AI meal payload received");
      return res.status(502).json({ error: "Unable to generate a meal right now. Please try again." });
    }
    return res.json({ meal: { ...mealData, category: pickedStyle.category } });
  } catch (error) {
    console.error("[/api/generate-meal] Error generating meal:", error);
    return res.status(500).json({ error: "Unable to generate a meal right now. Please try again." });
  }
});

// API: Turn random ingredients into 3 distinct meal options before cooking
app.post("/api/ingredients-to-meal", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const ingredientsParsed = validateStringArrayInput(body.ingredients);
    const rutParsed = validateStringArrayInput(body.rutMeals);
    const existingParsed = validateStringArrayInput(body.existingTitles);

    if (!ingredientsParsed.ok || !rutParsed.ok || !existingParsed.ok || ingredientsParsed.items.length === 0) {
      return res.status(400).json({
        error: "Invalid request parameters.",
      });
    }

    const ingredients = ingredientsParsed.items;
    const rutMeals = rutParsed.items;
    const existingTitles = existingParsed.items;
    const { kitchenMode, hardwarePromptRule } = parseKitchenConstraints(body);
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable.",
      });
    }

    const formatAngles: Array<{
      style: string;
      category: "assembly" | "microwave" | "one_skillet" | "sheet_pan" | "comfort";
    }> = kitchenMode === "microwave_only"
      ? [
          {
            style: "2-3 minute microwave mug, plate melt, or quesadilla (strictly microwave only)",
            category: "microwave",
          },
          {
            style: "zero-heat no-cook wrap, roll-up, or cold bowl (no microwave or cooking needed)",
            category: "assembly",
          },
          {
            style: "4-5 minute hearty microwave bowl mash-up in one deep microwave-safe bowl (strictly microwave only)",
            category: "microwave",
          },
        ]
      : [
          {
            style: "quick microwave bowl, wrap, or no-cook assembly (zero stove needed)",
            category: "microwave",
          },
          {
            style: "warm 1-skillet melt, quesadilla, toasted sandwich, or pan toss",
            category: "one_skillet",
          },
          {
            style: "cozy comfort bowl, savory rice/noodle mash-up, or easy bake",
            category: "comfort",
          },
        ];

    const buildRescuePrompt = (style: string) => `
The user has these ingredients on hand: ${ingredients.join(", ")}.
They want an effortless idea BEFORE committing to cook—make the title and 1-sentence tagline crystal clear about what the finished dish actually is.
Format/style for THIS specific option: ${style}.
CRITICAL RULES:
1. Build the dish primarily around these ingredients (plus at most 1-2 ultra-common basics like oil, salt, pepper, butter, or cheese; 3 to 5 ingredients total).
2. Keep instructions super clear: 3 to 4 steps maximum, stating exact ingredient names and amounts inside every step sentence so the cook never has to flip back and forth.
3. Avoid their usual rut: ${rutMeals.join(", ") || "none specified"}.
4. DO NOT repeat or closely match any of these titles: ${existingTitles.join(", ") || "none"}.
5. Include 2 optional 1-item add-ons and 2 zero-effort Walmart side pairings.
${hardwarePromptRule ? `6. ${hardwarePromptRule}` : ""}
`;

    const fetchOption = async (angle: (typeof formatAngles)[number]) => {
      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: buildRescuePrompt(angle.style),
          config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Ingredient rescue timed out")), 15000)
        ),
      ]);
      const meal = JSON.parse(response.text || "{}");
      if (meal?.title && Array.isArray(meal?.instructions)) {
        return {
          ...meal,
          category: angle.category,
        };
      }
      return null;
    };

    const results = await Promise.allSettled(formatAngles.map((a) => fetchOption(a)));
    const seenTitles = new Set<string>(existingTitles.map((t) => t.toLowerCase()));
    const validMeals: unknown[] = [];

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const lower = String(r.value.title).toLowerCase();
        if (!seenTitles.has(lower)) {
          seenTitles.add(lower);
          validMeals.push(r.value);
        }
      }
    }

    if (validMeals.length === 0) {
      console.error("[/api/ingredients-to-meal] No valid meal options generated");
      return res.status(502).json({ error: "Unable to create meal options from those ingredients right now." });
    }

    return res.json({ meals: validMeals, meal: validMeals[0] });
  } catch (error) {
    console.error("[/api/ingredients-to-meal] Error generating meal options from ingredients:", error);
    return res.status(500).json({ error: "Unable to create meal options from those ingredients right now." });
  }
});

// API: Suggest multiple fresh meals based on updated pantry items
app.post("/api/pantry-suggestions", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const pantryParsed = validateStringArrayInput(body.pantryItems);
    const existingParsed = validateStringArrayInput(body.existingTitles);
    const rutParsed = validateStringArrayInput(body.rutMeals);

    if (!pantryParsed.ok || !existingParsed.ok || !rutParsed.ok) {
      return res.status(400).json({
        error: "Invalid request parameters.",
      });
    }

    const pantryItems = pantryParsed.items;
    const existingTitles = existingParsed.items;
    const rutMeals = rutParsed.items;
    const { kitchenMode, hardwarePromptRule } = parseKitchenConstraints(body);
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable.",
      });
    }

    if (pantryItems.length === 0) {
      return res.json({ meals: [] });
    }

    const buildPrompt = (angle: string) => `
The user just updated their pantry/fridge with these ingredients: ${pantryItems.join(", ")}.
Suggest 1 dead-simple meal (${angle}) they can make using mostly items from their pantry (3 to 5 ingredients max; they can assume basic salt/pepper/oil or 1 quick missing item).
CRITICAL RULES:
1. 3 to 5 ingredients total and 3 to 4 super clear steps.
2. Every step MUST explicitly include exact ingredient names and amounts inside the step sentence so they never flip back and forth.
3. Do NOT repeat any of these existing meal titles: ${existingTitles.join(", ") || "none"}.
4. Avoid their rut items: ${rutMeals.join(", ") || "none"}.
5. Keep tone encouraging and practical.
${hardwarePromptRule ? `6. ${hardwarePromptRule}` : ""}
`;

    const fetchOne = async (angle: string, category: "assembly" | "microwave" | "one_skillet") => {
      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: buildPrompt(angle),
          config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Pantry suggestion timed out")), 12000)
        ),
      ]);
      const meal = JSON.parse(response.text || "{}");
      if (meal?.title && Array.isArray(meal?.instructions)) {
        return { ...meal, category };
      }
      return null;
    };

    const results = await Promise.allSettled(
      kitchenMode === "microwave_only"
        ? [
            fetchOne("zero-heat no-cook assembly wrap, sandwich, or bowl", "assembly"),
            fetchOne("3-5 minute microwave mug or deep-bowl warm meal (microwave only, no stove or kettle)", "microwave"),
          ]
        : [
            fetchOne("quick microwave or no-cook assembly", "microwave"),
            fetchOne("warm one-skillet or sheet-pan meal", "one_skillet"),
          ]
    );

    const seenTitles = new Set<string>(existingTitles.map((t) => t.toLowerCase()));
    const validMeals: unknown[] = [];
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
  } catch (error) {
    console.error("[/api/pantry-suggestions] Error generating pantry suggestions:", error);
    return res.status(500).json({ error: "Unable to load pantry suggestions right now." });
  }
});

// API: Generate 3 diverse fresh meal ideas at once (for varied households)
app.post("/api/generate-batch", aiRateLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const rutParsed = validateStringArrayInput(body.rutMeals);
    const existingParsed = validateStringArrayInput(body.existingTitles);
    const pantryParsed = validateStringArrayInput(body.pantryItems);

    if (!rutParsed.ok || !existingParsed.ok || !pantryParsed.ok) {
      return res.status(400).json({
        error: "Invalid request parameters.",
      });
    }

    const rutMeals = rutParsed.items;
    const existingTitles = existingParsed.items;
    const pantryItems = pantryParsed.items;
    const energyLevel =
      typeof body.energyLevel === "string"
        ? body.energyLevel.trim().slice(0, 60) || "all"
        : "all";
    const { kitchenMode, noFreezer, hardwarePromptRule } = parseKitchenConstraints(body);

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Meal generation is temporarily unavailable.",
      });
    }

    const dormAnglePool: Array<{ label: string; category: "microwave" | "assembly" }> = [
      { label: "3-minute microwave quesadilla, loaded nachos, or breakfast burrito (pizza quesadilla, chicken quesadilla, or bacon egg burrito)", category: "microwave" },
      { label: "zero-heat high-protein wrap or roll-up (buffalo chicken ranch wrap, turkey bacon club wrap, or deli sub roll-up)", category: "assembly" },
      { label: "5-minute microwave ramen or chili cheese mac bowl cooked right in a deep microwave bowl (no kettle or stove)", category: "microwave" },
      { label: "3-5 minute microwave rice bowl or hot sub (BBQ chicken sub, beef chili rice bowl, or mug scrambled egg tacos)", category: "microwave" },
      ...(noFreezer
        ? []
        : [{ label: "freezer-shortcut dorm favorite (meatball marinara sub, crispy chicken tender Caesar wrap, or teriyaki chicken & steam-bag broccoli rice bowl)", category: "microwave" as const }]),
    ];

    const fullKitchenAnglePool: Array<{ label: string; category: "microwave" | "assembly" | "one_skillet" | "sheet_pan" | "comfort" }> = [
      { label: "freezer shortcut meal (frozen chicken tenders, meatballs, potstickers, hashbrowns, or broccoli)", category: "one_skillet" },
      { label: "pantry & shelf-stable hearty meal (beef chili mac, pasta marinara, chicken ramen, rice bowl, or quesadillas)", category: "microwave" },
      { label: "fresh fridge & deli high-protein meal (eggs, bacon, buffalo/teriyaki chicken, deli turkey, bagged Caesar kit)", category: "assembly" },
      { label: "hot sub, melt, BBQ flatbread pizza, or toasted grilled cheese", category: "comfort" },
      { label: "quick Asian-inspired teriyaki rice bowl or potsticker stir-fry", category: "one_skillet" },
      { label: "breakfast-for-dinner bacon, egg, and hashbrown skillet or taco beef rice skillet", category: "one_skillet" }
    ];

    const pool = kitchenMode === "microwave_only" ? dormAnglePool : fullKitchenAnglePool;
    const shuffledAngles = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);

    const buildBatchPrompt = (angleLabel: string) => `
Suggest 1 completely original, effortless 3 to 5 ingredient Walmart meal in this style: ${angleLabel}.
Filter requested: "${energyLevel}".
${pantryItems.length > 0 ? `User has some of these items on hand (optional to incorporate): ${pantryItems.join(", ")}.` : "Assume a general Walmart shopper with standard dorm or household staples."}
CRITICAL RULES:
1. 3 to 5 ingredients max and 3 to 4 steps max.
2. Each step MUST state exact ingredient names and amounts directly inside the instruction sentence.
3. DO NOT repeat or closely match any of these existing titles: ${existingTitles.join(", ") || "none"}.
4. Avoid their rut items: ${rutMeals.join(", ") || "none"}.
${hardwarePromptRule ? `5. ${hardwarePromptRule}` : ""}
`;

    const fetchOne = async (angle: (typeof shuffledAngles)[number]) => {
      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: buildBatchPrompt(angle.label),
          config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Batch meal timed out")), 12000)
        ),
      ]);
      const meal = JSON.parse(response.text || "{}");
      if (meal?.title && Array.isArray(meal?.instructions)) {
        return { ...meal, category: angle.category };
      }
      return null;
    };

    const results = await Promise.allSettled(shuffledAngles.map((angle) => fetchOne(angle)));
    const seenTitles = new Set<string>(existingTitles.map((t) => t.toLowerCase()));
    const validMeals: unknown[] = [];
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
  } catch (error) {
    console.error("[/api/generate-batch] Error generating batch meals:", error);
    return res.status(500).json({ error: "Unable to generate meal ideas right now. Please try again." });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
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
