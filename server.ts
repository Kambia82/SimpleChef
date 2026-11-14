import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
app.post("/api/generate-meal", async (req, res) => {
  try {
    const {
      rutMeals = [],
      existingTitles = [],
      pantryItems = [],
      energyLevel = "super_low",
      timeLimit = 15,
      mood = "quick"
    } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured. Using pre-loaded low-effort meals.",
      });
    }

    const rutText = rutMeals.length > 0
      ? `The user wants to avoid these rut meals: ${rutMeals.join(", ")}. DO NOT suggest any of these or close duplicates.`
      : "Suggest a balanced, satisfying easy meal.";

    const existingText = Array.isArray(existingTitles) && existingTitles.length > 0
      ? `DO NOT repeat or closely duplicate ANY of these existing meals: ${existingTitles.slice(0, 40).join(", ")}.`
      : "";

    const pantryText = Array.isArray(pantryItems) && pantryItems.length > 0
      ? `The user happens to have these items in their fridge, freezer, or pantry (feel free to use 1-3 of them OR introduce fresh easy Walmart items for variety): ${pantryItems.slice(0, 25).join(", ")}.`
      : "Not every household keeps the same pantry items—feel free to use varied everyday Walmart fridge, freezer, or shelf staples (such as frozen meatballs, canned tuna, ramen, eggs, frozen veggies, pasta, deli turkey, rice, etc.).";

    const styles = [
      "cozy soup, melt, or toasted sandwich",
      "quick Asian-inspired noodle, rice, or dumpling bowl",
      "savory 1-skillet or sheet-pan dinner",
      "Mediterranean pita, chickpea, or salad bowl",
      "breakfast-for-dinner egg, hashbrown, or toast meal",
      "freezer-shortcut air-fryer or microwave dinner"
    ];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    const prompt = `
You are an empathetic, practical meal assistant for someone with low working memory, executive dysfunction, or mental exhaustion.
The user needs a meal that does the 'brain work' for them.
CRITICAL RULES:
1. NO MORE THAN 3 TO 5 INGREDIENTS TOTAL.
2. Standard, everyday items easily bought at Walmart (fridge, freezer, or shelf-stable staples).
3. The instructions MUST have 3 to 4 steps maximum.
4. INSTRUCTION RULE: The cook CANNOT keep looking back and forth between ingredient lists and instructions. So each step MUST state the ingredient and amount right in the sentence (e.g. "Dump 1 can of rinsed black beans and 1/2 cup of mild salsa into a microwave-safe bowl").
5. Style direction for variety: "${randomStyle}". Effort level requested: "${energyLevel}" (Time limit: max ${timeLimit} minutes, Mood: ${mood}).
6. ${rutText}
7. ${existingText}
8. ${pantryText}
9. Include real protein, fiber, or easy veggies while staying super satisfying and effortless.

Generate one fresh, distinct meal matching these strict cognitive-load constraints.
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
      return res.status(502).json({ error: "Incomplete meal returned by AI" });
    }
    return res.json({ meal: mealData });
  } catch (error: any) {
    console.error("Error generating meal:", error);
    return res.status(500).json({ error: error.message || "Failed to generate meal" });
  }
});

// API: Turn random ingredients into a real meal
app.post("/api/ingredients-to-meal", async (req, res) => {
  try {
    const { ingredients = [], rutMeals = [] } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const prompt = `
The user has these random ingredients they bought at the store: ${ingredients.join(", ")}.
They want an effortless way to turn individual ingredients into a real meal without overthinking.
Create ONE dead-simple, 3-4 step meal that uses these ingredients (plus at most 1-2 standard kitchen items like oil, salt, or cheese).
Keep instructions super clear, step-by-step, with ingredients and quantities in each step.
Avoid their usual rut: ${rutMeals.join(", ") || "none specified"}.
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
        setTimeout(() => reject(new Error("Ingredient rescue timed out")), 15000)
      ),
    ]);

    const mealData = JSON.parse(response.text || "{}");
    if (!mealData?.title || !Array.isArray(mealData?.instructions)) {
      return res.status(502).json({ error: "Incomplete meal returned by AI" });
    }
    return res.json({ meal: mealData });
  } catch (error: any) {
    console.error("Error generating meal from ingredients:", error);
    return res.status(500).json({ error: error.message || "Failed to turn ingredients into meal" });
  }
});

// API: Suggest multiple fresh meals based on updated pantry items
app.post("/api/pantry-suggestions", async (req, res) => {
  try {
    const { pantryItems = [], existingTitles = [], rutMeals = [] } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    if (!Array.isArray(pantryItems) || pantryItems.length === 0) {
      return res.json({ meals: [] });
    }

    const buildPrompt = (angle: string) => `
The user just updated their home pantry/fridge with these ingredients: ${pantryItems.join(", ")}.
Suggest 1 dead-simple meal (${angle}) they can make using mostly items from their pantry (3 to 5 ingredients max; they can assume basic salt/pepper/oil or 1 quick missing item).
CRITICAL RULES:
1. 3 to 5 ingredients total and 3 to 4 super clear steps.
2. Every step MUST explicitly include exact ingredient names and amounts inside the step sentence so they never flip back and forth.
3. Do NOT repeat any of these existing meal titles: ${existingTitles.slice(0, 25).join(", ") || "none"}.
4. Avoid their rut items: ${rutMeals.join(", ") || "none"}.
5. Keep tone encouraging and practical.
`;

    const fetchOne = async (angle: string) => {
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
        return meal;
      }
      return null;
    };

    const results = await Promise.allSettled([
      fetchOne("quick microwave or no-cook assembly"),
      fetchOne("warm one-skillet or sheet-pan meal"),
    ]);

    const seenTitles = new Set<string>(existingTitles.map((t: string) => String(t).toLowerCase()));
    const validMeals: any[] = [];
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
  } catch (error: any) {
    console.error("Error generating pantry suggestions:", error);
    return res.status(500).json({ error: error.message || "Failed to generate pantry suggestions" });
  }
});

// API: Generate 3 diverse fresh meal ideas at once (for varied households)
app.post("/api/generate-batch", async (req, res) => {
  try {
    const { rutMeals = [], existingTitles = [], pantryItems = [], energyLevel = "all" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const anglePool = [
      "freezer shortcut meal (using frozen veggies, meatballs, shrimp, dumplings, or tenders)",
      "pantry & shelf-stable meal (canned tuna/chickpeas/soup, oats, pasta, rice pouch, or bread)",
      "fresh fridge & deli no-fuss meal (eggs, deli meat, salad kit, cottage cheese, or yogurt)",
      "cozy toasted sandwich, wrap, or soup combo",
      "quick Asian-inspired stir-fry or noodle bowl",
      "Mediterranean or breakfast-for-dinner skillet"
    ];
    const shuffledAngles = [...anglePool].sort(() => Math.random() - 0.5).slice(0, 3);

    const buildBatchPrompt = (angle: string) => `
Suggest 1 completely original, effortless 3 to 5 ingredient Walmart meal in this style: ${angle}.
Filter requested: "${energyLevel}".
${Array.isArray(pantryItems) && pantryItems.length > 0 ? `User has some of these items at home (optional to incorporate): ${pantryItems.slice(0, 20).join(", ")}.` : "Assume a general Walmart shopper with standard fridge/freezer/pantry options."}
CRITICAL RULES:
1. 3 to 5 ingredients max and 3 to 4 steps max.
2. Each step MUST state exact ingredient names and amounts directly inside the instruction sentence.
3. DO NOT repeat or closely match any of these existing titles: ${existingTitles.slice(0, 45).join(", ") || "none"}.
4. Avoid their rut items: ${rutMeals.join(", ") || "none"}.
`;

    const fetchOne = async (angle: string) => {
      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: buildBatchPrompt(angle),
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
        return meal;
      }
      return null;
    };

    const results = await Promise.allSettled(shuffledAngles.map((angle) => fetchOne(angle)));
    const seenTitles = new Set<string>(existingTitles.map((t: string) => String(t).toLowerCase()));
    const validMeals: any[] = [];
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
  } catch (error: any) {
    console.error("Error generating batch meals:", error);
    return res.status(500).json({ error: error.message || "Failed to generate meal batch" });
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
