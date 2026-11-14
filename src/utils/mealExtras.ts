import { Meal, MealAddon } from "../types";

export function getMealExtras(meal: Meal): {
  addons: MealAddon[];
  sides: MealAddon[];
} {
  if (
    Array.isArray(meal.optionalAddons) &&
    meal.optionalAddons.length > 0 &&
    Array.isArray(meal.sidePairings) &&
    meal.sidePairings.length > 0
  ) {
    return {
      addons: meal.optionalAddons,
      sides: meal.sidePairings,
    };
  }

  const text = `${meal.title} ${meal.ingredients.map((i) => i.item).join(" ")}`.toLowerCase();

  // Tex-Mex / Taco / Quesadilla / Chili / Bean bowls
  if (
    /taco|quesadilla|fiesta|salsa|chili|black bean|enchilada|burrito/.test(text)
  ) {
    return {
      addons: meal.optionalAddons?.length
        ? meal.optionalAddons
        : [
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
          ],
      sides: meal.sidePairings?.length
        ? meal.sidePairings
        : [
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
          ],
    };
  }

  // Italian / Pasta / Pizza / Meatball / Tomato Soup
  if (
    /pasta|tortellini|marinara|alfredo|pesto|pizza|naan|meatball|tomato soup|grilled cheese/.test(
      text
    )
  ) {
    return {
      addons: meal.optionalAddons?.length
        ? meal.optionalAddons
        : [
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
          ],
      sides: meal.sidePairings?.length
        ? meal.sidePairings
        : [
            {
              item: "Bagged Caesar salad kit",
              howToUse: "Dump greens, dressing, and croutons into a bowl and toss.",
              walmartAisle: "Produce",
            },
            {
              item: "Frozen garlic Texas toast",
              howToUse: "Toast 1-2 slices in a toaster oven or air fryer for 5 minutes.",
              walmartAisle: "Frozen",
            },
            {
              item: "Steamed frozen green beans or broccoli",
              howToUse: "Microwave a steam-in-bag pouch for 4 minutes with a pinch of salt.",
              walmartAisle: "Frozen",
            },
          ],
    };
  }

  // Asian-inspired / Ramen / Potstickers / Egg Roll / Teriyaki / Shrimp
  if (/ramen|potsticker|dumpling|egg roll|soy sauce|teriyaki|shrimp/.test(text)) {
    return {
      addons: meal.optionalAddons?.length
        ? meal.optionalAddons
        : [
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
          ],
      sides: meal.sidePairings?.length
        ? meal.sidePairings
        : [
            {
              item: "Frozen steam-in-bag edamame",
              howToUse: "Microwave the bag for 4 minutes and sprinkle with sea salt.",
              walmartAisle: "Frozen",
            },
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
          ],
    };
  }

  // Breakfast-for-dinner / Eggs / Oatmeal / Yogurt / Waffle / Hashbrown
  if (/egg|oatmeal|yogurt|waffle|hashbrown/.test(text)) {
    return {
      addons: meal.optionalAddons?.length
        ? meal.optionalAddons
        : [
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
          ],
      sides: meal.sidePairings?.length
        ? meal.sidePairings
        : [
            {
              item: "Fresh banana or pre-sliced apple bag",
              howToUse: "Grab and eat alongside—zero prep.",
              walmartAisle: "Produce",
            },
            {
              item: "Frozen berries (thawed 30 sec in microwave)",
              howToUse: "Warm briefly in a small bowl for a quick fruit side.",
              walmartAisle: "Frozen",
            },
            {
              item: "Buttered toast or English muffin",
              howToUse: "Pop in the toaster while everything else finishes.",
              walmartAisle: "Bakery",
            },
          ],
    };
  }

  // Sandwiches / Wraps / Pita / Tuna / Deli / Sweet Potato / Sheet Pan
  return {
    addons: meal.optionalAddons?.length
      ? meal.optionalAddons
      : [
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
        ],
    sides: meal.sidePairings?.length
      ? meal.sidePairings
      : [
          {
            item: "Baby carrots & ranch or hummus",
            howToUse: "Pour straight onto the plate—zero washing or cutting.",
            walmartAisle: "Produce",
          },
          {
            item: "Steam-in-bag frozen broccoli or mixed veggies",
            howToUse: "Microwave the pouch 4-5 minutes for a hot veggie side.",
            walmartAisle: "Frozen",
          },
          {
            item: "Pre-cut watermelon or grape cup",
            howToUse: "Ready-to-eat sweet side straight from the fridge.",
            walmartAisle: "Produce",
          },
        ],
  };
}
