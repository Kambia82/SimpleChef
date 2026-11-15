import { CookingEquipment, Meal, MealAddon } from "../types";

const TOASTER_OR_OVEN_REGEX = /\b(toaster oven|toaster|air fryer|air-fry|broil|bake)\b/i;
const STOVE_REGEX = /\b(skillet|frying pan|stovetop|stove|simmer|boil in a pot)\b/i;
const FROZEN_REGEX = /\bfrozen\b|\bfreezer\b/i;

export interface ExtrasFilterOptions {
  equipment?: CookingEquipment[];
  hasFreezer?: boolean;
}

function isAddonAllowed(addon: MealAddon, options?: ExtrasFilterOptions): boolean {
  if (!options) return true;
  const text = `${addon.item} ${addon.howToUse}`;
  const hasFreezer = options.hasFreezer ?? options.equipment?.includes("freezer") ?? true;

  if (!hasFreezer && (addon.walmartAisle === "Frozen" || FROZEN_REGEX.test(text))) {
    return false;
  }

  if (options.equipment && options.equipment.length > 0) {
    const eq = new Set(options.equipment);
    if (TOASTER_OR_OVEN_REGEX.test(text)) {
      const canToastOrBake =
        eq.has("toaster") || eq.has("air_fryer") || eq.has("oven");
      if (!canToastOrBake) return false;
    }
    if (STOVE_REGEX.test(text) && !eq.has("stove")) {
      return false;
    }
    if (/\bmicrowave\b/i.test(text) && !eq.has("microwave")) {
      return false;
    }
  }

  return true;
}

export function getMealExtras(
  meal: Meal,
  options?: ExtrasFilterOptions
): {
  addons: MealAddon[];
  sides: MealAddon[];
} {
  const hasFreezer = options?.hasFreezer ?? options?.equipment?.includes("freezer") ?? true;
  const canToast =
    !options?.equipment ||
    options.equipment.includes("toaster") ||
    options.equipment.includes("air_fryer") ||
    options.equipment.includes("oven");

  const filterList = (list: MealAddon[]) =>
    list.filter((entry) => isAddonAllowed(entry, options));

  if (
    Array.isArray(meal.optionalAddons) &&
    meal.optionalAddons.length > 0 &&
    Array.isArray(meal.sidePairings) &&
    meal.sidePairings.length > 0
  ) {
    const filteredAddons = filterList(meal.optionalAddons);
    const filteredSides = filterList(meal.sidePairings);
    if (filteredAddons.length > 0 && filteredSides.length > 0) {
      return {
        addons: filteredAddons,
        sides: filteredSides,
      };
    }
  }

  const text = `${meal.title} ${meal.ingredients.map((i) => i.item).join(" ")}`.toLowerCase();

  // Tex-Mex / Taco / Quesadilla / Chili / Bean bowls
  if (/taco|quesadilla|fiesta|salsa|chili|black bean|enchilada|burrito/.test(text)) {
    const defaultAddons: MealAddon[] = [
      {
        item: "Canned corn or pickled jalapeños",
        howToUse: "Drain and stir a handful straight in for extra crunch or heat.",
        walmartAisle: "Pantry / Canned",
      },
      {
        item: "Sour cream or plain Greek yogurt",
        howToUse: "Drop a cool spoonful right on top before eating.",
        walmartAisle: "Dairy & Eggs",
      },
      {
        item: "Taco seasoning or cumin",
        howToUse: "Shake 1/2 teaspoon in while warming for bolder flavor.",
        walmartAisle: "Spices & Condiments",
      },
    ];
    const defaultSides: MealAddon[] = [
      {
        item: "Bagged Southwest chopped salad kit",
        howToUse: "Toss in a side bowl with the included dressing packet—zero chopping.",
        walmartAisle: "Produce",
      },
      {
        item: "Tortilla chips & mini guacamole cup",
        howToUse: "Serve a small handful on the side for dipping.",
        walmartAisle: "Pantry / Canned",
      },
      {
        item: "Fresh pineapple or mango chunks (pre-cut cup)",
        howToUse: "Sweet, cold contrast with zero prep.",
        walmartAisle: "Produce",
      },
    ];
    return {
      addons: filterList(meal.optionalAddons?.length ? meal.optionalAddons : defaultAddons),
      sides: filterList(meal.sidePairings?.length ? meal.sidePairings : defaultSides),
    };
  }

  // Italian / Pasta / Pizza / Meatball / Tomato Soup
  if (/pasta|tortellini|marinara|alfredo|pesto|pizza|naan|meatball|tomato soup|grilled cheese/.test(text)) {
    const defaultAddons: MealAddon[] = [
      {
        item: "Crushed red pepper flakes or Italian seasoning",
        howToUse: "Sprinkle a pinch on top right before serving.",
        walmartAisle: "Spices & Condiments",
      },
      {
        item: "Grated parmesan cheese",
        howToUse: "Shake 1-2 tablespoons over the hot dish for savory depth.",
        walmartAisle: "Dairy & Eggs",
      },
      {
        item: "Baby spinach",
        howToUse: "Stir a handful into the hot sauce or soup for 30 seconds until wilted.",
        walmartAisle: "Produce",
      },
    ];
    const defaultSides: MealAddon[] = [
      {
        item: "Bagged Caesar salad kit",
        howToUse: "Dump greens, dressing, and croutons into a bowl and toss.",
        walmartAisle: "Produce",
      },
      ...(hasFreezer && canToast
        ? [
            {
              item: "Frozen garlic Texas toast",
              howToUse: "Toast 1-2 slices in a toaster oven or air fryer for 5 minutes.",
              walmartAisle: "Frozen" as const,
            },
          ]
        : [
            {
              item: "Pre-cut Italian herb breadsticks or dinner rolls",
              howToUse: "Serve right on the plate for dipping into warm marinara.",
              walmartAisle: "Bakery" as const,
            },
          ]),
      ...(hasFreezer
        ? [
            {
              item: "Steamed frozen green beans or broccoli",
              howToUse: "Microwave a steam-in-bag pouch for 4 minutes with a pinch of salt.",
              walmartAisle: "Frozen" as const,
            },
          ]
        : [
            {
              item: "Baby carrots or cherry tomatoes",
              howToUse: "Rinse and eat raw alongside the meal for zero-prep crunch.",
              walmartAisle: "Produce" as const,
            },
          ]),
    ];
    return {
      addons: filterList(meal.optionalAddons?.length ? meal.optionalAddons : defaultAddons),
      sides: filterList(meal.sidePairings?.length ? meal.sidePairings : defaultSides),
    };
  }

  // Asian-inspired / Ramen / Potstickers / Egg Roll / Teriyaki / Shrimp
  if (/ramen|potsticker|dumpling|egg roll|soy sauce|teriyaki|shrimp/.test(text)) {
    const defaultAddons: MealAddon[] = [
      {
        item: "Sriracha or chili crisp",
        howToUse: "Drizzle a few drops on top for gentle kick and crunch.",
        walmartAisle: "Spices & Condiments",
      },
      {
        item: "Shredded carrots or green onions",
        howToUse: "Scatter a pinch on top for fresh crunch.",
        walmartAisle: "Produce",
      },
      {
        item: "Toasted sesame oil",
        howToUse: "Swirl 1/2 teaspoon in right before serving for takeout aroma.",
        walmartAisle: "Spices & Condiments",
      },
    ];
    const defaultSides: MealAddon[] = [
      ...(hasFreezer
        ? [
            {
              item: "Frozen steam-in-bag edamame",
              howToUse: "Microwave the bag for 4 minutes and sprinkle with sea salt.",
              walmartAisle: "Frozen" as const,
            },
          ]
        : []),
      {
        item: "Bagged Asian sesame salad kit",
        howToUse: "Toss cold crunchy cabbage salad next to your warm bowl.",
        walmartAisle: "Produce",
      },
      {
        item: "Mandarin orange cups or sliced cucumber",
        howToUse: "Eat straight from the cup for a cool, refreshing side.",
        walmartAisle: "Pantry / Canned",
      },
    ];
    return {
      addons: filterList(meal.optionalAddons?.length ? meal.optionalAddons : defaultAddons),
      sides: filterList(meal.sidePairings?.length ? meal.sidePairings : defaultSides),
    };
  }

  // Breakfast-for-dinner / Eggs / Oatmeal / Yogurt / Waffle / Hashbrown
  if (/egg|oatmeal|yogurt|waffle|hashbrown/.test(text)) {
    const defaultAddons: MealAddon[] = [
      {
        item: "Hot sauce, salsa, or everything bagel seasoning",
        howToUse: "Shake directly onto eggs or savory breakfast items.",
        walmartAisle: "Spices & Condiments",
      },
      {
        item: "Chia seeds or sliced almonds",
        howToUse: "Sprinkle 1 tablespoon over yogurt or oatmeal for extra crunch.",
        walmartAisle: "Pantry / Canned",
      },
    ];
    const defaultSides: MealAddon[] = [
      {
        item: "Fresh banana or pre-sliced apple bag",
        howToUse: "Grab and eat alongside—zero prep.",
        walmartAisle: "Produce",
      },
      ...(hasFreezer
        ? [
            {
              item: "Frozen berries (thawed 30 sec in microwave)",
              howToUse: "Warm briefly in a small bowl for a quick fruit side.",
              walmartAisle: "Frozen" as const,
            },
          ]
        : [
            {
              item: "Fresh blueberries or strawberries",
              howToUse: "Rinse a handful for a fast side of fresh fruit.",
              walmartAisle: "Produce" as const,
            },
          ]),
      ...(canToast
        ? [
            {
              item: "Buttered toast or English muffin",
              howToUse: "Pop in the toaster while everything else finishes.",
              walmartAisle: "Bakery" as const,
            },
          ]
        : [
            {
              item: "Vanilla Greek yogurt cup",
              howToUse: "Peel open an individual yogurt cup alongside your plate.",
              walmartAisle: "Dairy & Eggs" as const,
            },
          ]),
    ];
    return {
      addons: filterList(meal.optionalAddons?.length ? meal.optionalAddons : defaultAddons),
      sides: filterList(meal.sidePairings?.length ? meal.sidePairings : defaultSides),
    };
  }

  // Sandwiches / Wraps / Pita / Tuna / Deli / Sweet Potato / Sheet Pan
  const fallbackAddons: MealAddon[] = [
    {
      item: "Garlic powder, lemon pepper, or Everything Bagel seasoning",
      howToUse: "Sprinkle 1/2 teaspoon right over the dish to wake up the flavor.",
      walmartAisle: "Spices & Condiments",
    },
    {
      item: "Shredded cheese or crumbled feta",
      howToUse: "Scatter a small handful on top while warm or inside wraps.",
      walmartAisle: "Dairy & Eggs",
    },
    {
      item: "Sriracha, honey mustard, or ranch drizzle",
      howToUse: "Add a quick squeeze on top for extra savory-tangy punch.",
      walmartAisle: "Spices & Condiments",
    },
  ];
  const fallbackSides: MealAddon[] = [
    {
      item: "Baby carrots & ranch or hummus",
      howToUse: "Pour straight onto the plate—zero washing or cutting.",
      walmartAisle: "Produce",
    },
    ...(hasFreezer
      ? [
          {
            item: "Steam-in-bag frozen broccoli or mixed veggies",
            howToUse: "Microwave the pouch 4-5 minutes for a hot veggie side.",
            walmartAisle: "Frozen" as const,
          },
        ]
      : []),
    {
      item: "Pre-cut watermelon or grape cup",
      howToUse: "Ready-to-eat sweet side straight from the fridge.",
      walmartAisle: "Produce",
    },
  ];

  return {
    addons: filterList(meal.optionalAddons?.length ? meal.optionalAddons : fallbackAddons),
    sides: filterList(meal.sidePairings?.length ? meal.sidePairings : fallbackSides),
  };
}
