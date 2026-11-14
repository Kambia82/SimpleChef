import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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
  },
  required: ["title", "tagline", "prepMinutes", "cookMinutes", "ingredients", "instructions", "whyItWorks", "rutAlternativeNote"],
};

// API: Generate low-effort meal
app.post("/api/generate-meal", async (req, res) => {
  try {
    const { rutMeals = [], energyLevel = "super_low", timeLimit = 15, mood = "quick" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured. Using pre-loaded low-effort meals.",
      });
    }

    const rutText = rutMeals.length > 0
      ? `The user is stuck in a rut eating these exact things: ${rutMeals.join(", ")}. DO NOT suggest any of these or close duplicates. Suggest a fresh, delicious, easy alternative that requires no more effort.`
      : "The user often falls back to chips and salsa or snacking on ingredients instead of meals.";

    const prompt = `
You are an empathetic, practical meal assistant for someone with low working memory, executive dysfunction, or mental exhaustion.
The user needs a meal that does the 'brain work' for them.
CRITICAL RULES:
1. NO MORE THAN 3 TO 5 INGREDIENTS TOTAL.
2. Standard, everyday items easily bought at Walmart (e.g. bagged salad kits, rotisserie chicken, frozen ravioli, canned beans, tortillas, pre-shredded cheese, steam-in-bag broccoli).
3. The instructions MUST have 3 to 4 steps maximum.
4. INSTRUCTION RULE: The cook CANNOT keep looking back and forth between ingredient lists and instructions. So each step MUST state the ingredient and amount right in the sentence (e.g. "Dump the 1 can of rinsed black beans and 1/2 cup of mild salsa into a microwave-safe bowl").
5. Effort level requested: "${energyLevel}" (Time limit: max ${timeLimit} minutes, Mood: ${mood}).
6. ${rutText}
7. Healthier than eating chips and salsa or junk food: real protein, real fiber, or easy veggies, but tastes super satisfying.

Generate one perfect meal matching these strict cognitive-load constraints.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.7,
      },
    });

    const mealData = JSON.parse(response.text || "{}");
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
They usually buy ingredients and never meals, then get overwhelmed and eat chips and salsa.
Create ONE dead-simple, 3-4 step meal that uses these ingredients (plus at most 1-2 standard kitchen items like oil, salt, or cheese).
Keep instructions super clear, step-by-step, with ingredients and quantities in each step.
Avoid their usual rut: ${rutMeals.join(", ") || "none specified"}.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.6,
      },
    });

    const mealData = JSON.parse(response.text || "{}");
    return res.json({ meal: mealData });
  } catch (error: any) {
    console.error("Error generating meal from ingredients:", error);
    return res.status(500).json({ error: error.message || "Failed to turn ingredients into meal" });
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
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
