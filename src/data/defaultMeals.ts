import { Meal } from "../types";

export const DEFAULT_MEALS: Meal[] = [
  {
    id: "black-bean-salsa-bowl",
    title: "5-Minute Cheesy Fiesta Rice Bowl",
    tagline: "The healthy upgrade to chips & salsa: zero chopping, warm, filling, and done in 4 minutes.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Microwave Jasmine or White Rice pouch", amount: "1 pouch (ready in 90 sec)", walmartAisle: "Pantry / Canned", tip: "Great Value brand is under $1.50" },
      { item: "Black beans (canned)", amount: "1 can (rinsed & drained)", walmartAisle: "Pantry / Canned" },
      { item: "Salsa of choice", amount: "1/2 cup", walmartAisle: "Pantry / Canned", tip: "Get your favorite jarred salsa" },
      { item: "Shredded Mexican blend cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Guacamole cup or avocado", amount: "1 single-serve mini cup", walmartAisle: "Produce", tip: "Mini cups won't go bad in your fridge" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave the Rice Pouch",
        instruction: "Squeeze the 1 pouch of microwave rice to break up clumps, tear the pouch open 2 inches at the top, and microwave for 90 seconds.",
        timerSeconds: 90
      },
      {
        stepNumber: 2,
        title: "Rinse & Warm the Beans",
        instruction: "Open 1 can of black beans, dump half the can into a colander to rinse under cold water, then shake off water and dump into an eating bowl.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Combine & Melt Cheese",
        instruction: "Pour the hot microwaved rice into the bowl over the beans. Stir in 1/2 cup of salsa, then top with 1/2 cup of shredded cheese. Microwave the bowl for 30 seconds to melt the cheese.",
        timerSeconds: 30
      },
      {
        stepNumber: 4,
        title: "Top with Guacamole & Eat",
        instruction: "Spoon 1 mini cup of guacamole right on top. If you have tortilla chips, crunch 4-5 on top for texture, or just eat with a spoon!",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Has all the zesty, salty, cheesy flavors of chips and salsa, but gives your body 20g of clean protein and dietary fiber so you stay satisfied for hours.",
    rutAlternativeNote: "Direct replacement when you are craving chips & salsa but need real nutritional fuel."
  },
  {
    id: "rotisserie-pesto-tortellini",
    title: "10-Minute Pesto Tortellini with Shredded Chicken",
    tagline: "Boil water, dump pasta, toss with chicken and jarred pesto. Tastes like a cozy restaurant dish.",
    prepMinutes: 2,
    cookMinutes: 6,
    category: "one_skillet",
    ingredients: [
      { item: "Refrigerated cheese tortellini", amount: "1 package (9-10 oz)", walmartAisle: "Dairy & Eggs", tip: "Boils in just 4 minutes" },
      { item: "Rotisserie chicken or pre-shredded chicken breast", amount: "1.5 cups shredded", walmartAisle: "Meat & Deli", tip: "Walmart deli rotisserie or pre-pulled tub" },
      { item: "Jarred basil pesto", amount: "3-4 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Cherry tomatoes (optional)", amount: "1 handful", walmartAisle: "Produce", tip: "No chopping needed if you want them whole" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Boil the Tortellini",
        instruction: "Bring a medium pot of salted water to a rolling boil. Drop the 1 package of refrigerated cheese tortellini into the water and cook for 4 minutes until they float.",
        timerSeconds: 240
      },
      {
        stepNumber: 2,
        title: "Drain Pasta",
        instruction: "Pour the tortellini into a colander in the sink to drain all the water out, then dump the tortellini back into the warm pot (burner turned off).",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Stir in Pesto & Chicken",
        instruction: "Add 1.5 cups of shredded rotisserie chicken and 3-4 tablespoons of jarred pesto directly into the pot with the pasta. Stir gently for 1 minute until warm.",
        timerSeconds: 60
      }
    ],
    whyItWorks: "Refrigerated pasta cooks in under 4 minutes, and rotisserie chicken is already seasoned and fully cooked. Only 1 pot to wash.",
    rutAlternativeNote: "Replaces heavy instant ramen or boxed macaroni with real protein and high-energy fresh pasta."
  },
  {
    id: "sheet-pan-smoked-sausage-veggies",
    title: "No-Chop Sheet Pan Sausage & Veggies",
    tagline: "Toss everything on foil, bake for 18 minutes, throw the foil in the trash. Zero cleanup.",
    prepMinutes: 3,
    cookMinutes: 18,
    category: "sheet_pan",
    ingredients: [
      { item: "Pre-cooked turkey or beef smoked sausage / kielbasa", amount: "1 link (12-14 oz)", walmartAisle: "Meat & Deli", tip: "Pre-cooked means it just needs browning" },
      { item: "Frozen bell pepper & onion strips", amount: "1 bag (16 oz)", walmartAisle: "Frozen", tip: "Already sliced and washed" },
      { item: "Olive oil or cooking spray", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Garlic powder or Italian seasoning", amount: "1 teaspoon", walmartAisle: "Spices & Condiments" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Line Pan & Preheat Oven",
        instruction: "Preheat your oven to 400°F. Line a large baking sheet with aluminum foil or parchment paper so you won't have dishes to wash.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Slice Sausage & Dump Frozen Veggies",
        instruction: "Slice the 1 link of sausage into coin-sized discs using butter knife or kitchen shears. Dump the sausage coins and the 1 whole bag of frozen peppers/onions onto the foil-lined pan.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Season & Roast",
        instruction: "Drizzle 2 tablespoons of olive oil over everything, shake on 1 teaspoon of garlic powder/seasoning, and toss with your hands. Spread into a flat layer and bake for 18 minutes.",
        timerSeconds: 1080
      }
    ],
    whyItWorks: "Frozen veggies don't rot in the crisper drawer, require zero knife skills, and caramelize alongside savory sausage.",
    rutAlternativeNote: "Keeps you from buying fresh veggies that rot before you get around to washing and chopping them."
  },
  {
    id: "bbq-chicken-flatbread-pizza",
    title: "Crispy Naan BBQ Chicken Pizza",
    tagline: "Better than delivery, takes 8 minutes, and uses ingredients you can keep in your freezer and fridge.",
    prepMinutes: 2,
    cookMinutes: 8,
    category: "assembly",
    ingredients: [
      { item: "Stonefire or Great Value Naan flatbreads", amount: "2 flatbreads", walmartAisle: "Bakery", tip: "Freeze what you don't use" },
      { item: "Rotisserie chicken (shredded)", amount: "1 cup", walmartAisle: "Meat & Deli" },
      { item: "BBQ sauce (Sweet Baby Ray's or similar)", amount: "3 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Shredded mozzarella or colby jack cheese", amount: "3/4 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Spread BBQ Sauce on Naan",
        instruction: "Place 2 naan breads onto a toaster oven tray or baking sheet. Spoon 1.5 tablespoons of BBQ sauce onto each naan and smear to the edges.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Top with Chicken & Cheese",
        instruction: "Scatter 1/2 cup of shredded chicken evenly across each naan, then sprinkle 3/4 cup total of shredded cheese over the top.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Bake until Bubbly",
        instruction: "Bake at 400°F (or toast in toaster oven) for 7 to 8 minutes until cheese is melted and crust edges are golden brown. Slice and serve!",
        timerSeconds: 450
      }
    ],
    whyItWorks: "Naan flatbread is already baked bread, so there is no raw dough. It crisps up in minutes with zero mess.",
    rutAlternativeNote: "Replaces frozen convenience pizzas with high-protein real chicken and wholesome flatbread."
  },
  {
    id: "dump-and-heat-chili-mac",
    title: "1-Skillet Creamy Beef & Bean Chili Mac",
    tagline: "Rich, comforting, and packed with 30g protein. Dump 3 canned items together and stir.",
    prepMinutes: 1,
    cookMinutes: 7,
    category: "one_skillet",
    ingredients: [
      { item: "Canned beef chili without beans (Hormel or Great Value)", amount: "1 can (15 oz)", walmartAisle: "Pantry / Canned" },
      { item: "Black beans or pinto beans (canned)", amount: "1 can (rinsed & drained)", walmartAisle: "Pantry / Canned" },
      { item: "Cooked elbow macaroni or pre-cooked rice pouch", amount: "1 pouch or 1 cup cooked", walmartAisle: "Pantry / Canned" },
      { item: "Shredded cheddar cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Dump into Skillet",
        instruction: "In a medium non-stick skillet over medium heat, dump the 1 can of beef chili, the 1 can of rinsed black beans, and the cooked pasta/rice.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Stir & Warm Through",
        instruction: "Stir occasionally for about 5 minutes until bubbling gently and steaming hot.",
        timerSeconds: 300
      },
      {
        stepNumber: 3,
        title: "Melt the Cheese",
        instruction: "Turn off heat, sprinkle 1/2 cup of shredded cheddar cheese over the top, cover with a lid or foil for 2 minutes to melt, and eat straight from a bowl.",
        timerSeconds: 120
      }
    ],
    whyItWorks: "Everything comes from long-shelf-life staples, meaning you can keep these in your pantry for weeks and always have dinner ready.",
    rutAlternativeNote: "Takes the exact same time as boxed mac and cheese, but with way more protein and sustained energy."
  },
  {
    id: "loaded-sweet-potato",
    title: "Microwave Loaded Black Bean Sweet Potato",
    tagline: "Poke with fork, 5 mins in microwave, split open and stuff. Naturally sweet, savory, and effortless.",
    prepMinutes: 2,
    cookMinutes: 5,
    category: "microwave",
    ingredients: [
      { item: "Medium sweet potato", amount: "1 sweet potato", walmartAisle: "Produce", tip: "Wash skin with warm water" },
      { item: "Black beans (canned)", amount: "1/3 can", walmartAisle: "Pantry / Canned" },
      { item: "Salsa or sour cream", amount: "2 tablespoons", walmartAisle: "Dairy & Eggs" },
      { item: "Feta or shredded cheddar cheese", amount: "2 tablespoons", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Poke & Microwave Sweet Potato",
        instruction: "Wash 1 medium sweet potato and poke it 5-6 times with a fork all over. Place on a microwave-safe plate and microwave on HIGH for 5 minutes (flip halfway if possible).",
        timerSeconds: 300
      },
      {
        stepNumber: 2,
        title: "Slice Open",
        instruction: "Use a knife to cut a slit down the middle lengthwise. Squeeze both ends with a paper towel to puff the soft orange potato interior open.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Stuff with Beans & Toppings",
        instruction: "Spoon 1/3 cup of black beans into the opening. Top with 2 tablespoons of salsa, 2 tablespoons of sour cream, and 2 tablespoons of cheese.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Complex carbohydrates, vitamin A, and fiber that digest smoothly and prevent energy crashes.",
    rutAlternativeNote: "Satisfies the savory/carb craving without needing to touch a stove or wash pots."
  },
  {
    id: "greek-pita-chicken-pocket",
    title: "4-Minute Greek Deli Chicken Pita",
    tagline: "No cooking whatsoever. Warm pita pocket stuffed with crisp greens, chicken, and tzatziki.",
    prepMinutes: 4,
    cookMinutes: 0,
    category: "assembly",
    ingredients: [
      { item: "Pita bread or Flatout flatbreads", amount: "1 pita pocket", walmartAisle: "Bakery" },
      { item: "Tzatziki sauce or cucumber garlic dressing", amount: "2 tablespoons", walmartAisle: "Dairy & Eggs", tip: "Found near hummus in Walmart deli" },
      { item: "Deli chicken breast or pre-cooked grilled chicken strips", amount: "3-4 slices (or 1/2 cup strips)", walmartAisle: "Meat & Deli" },
      { item: "Baby spinach or pre-washed salad greens", amount: "1 big handful", walmartAisle: "Produce" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Warm the Pita (Optional)",
        instruction: "Pop 1 pita pocket into the microwave for 15 seconds to make it soft and pliable. Cut in half across the center to make two pockets.",
        timerSeconds: 15
      },
      {
        stepNumber: 2,
        title: "Spread Tzatziki Inside",
        instruction: "Using a spoon, spread 1 tablespoon of tzatziki sauce inside each pita pocket half.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Stuff & Enjoy",
        instruction: "Slide 3-4 slices of chicken and 1 big handful of baby spinach inside. No pan, no heat, pure fresh crunch.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Zero heat required. It takes less time to make than opening a bag of chips, but provides clean protein and hydration.",
    rutAlternativeNote: "Prevents buying a giant loaf of sandwich bread that turns moldy before you finish it."
  },
  {
    id: "egg-roll-in-a-skillet",
    title: "1-Skillet Egg Roll Bowl with Coleslaw Mix",
    tagline: "A whole bag of crunchy shredded cabbage cooked down in 8 minutes with savory ground turkey or pork.",
    prepMinutes: 1,
    cookMinutes: 8,
    category: "one_skillet",
    ingredients: [
      { item: "Bagged tri-color coleslaw mix (shredded cabbage & carrots)", amount: "1 whole bag (14 oz)", walmartAisle: "Produce", tip: "No chopping needed" },
      { item: "Ground turkey or lean ground pork", amount: "1/2 lb (or pre-cooked breakfast sausage)", walmartAisle: "Meat & Deli" },
      { item: "Soy sauce or Teriyaki sauce", amount: "2-3 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Sesame oil or garlic powder", amount: "1 teaspoon", walmartAisle: "Spices & Condiments" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Brown the Meat",
        instruction: "In a large skillet over medium-high heat, cook 1/2 lb of ground meat, breaking it apart with a wooden spoon for 5 minutes until no longer pink.",
        timerSeconds: 300
      },
      {
        stepNumber: 2,
        title: "Dump the Whole Bag of Slaw",
        instruction: "Dump the entire bag of coleslaw mix right into the skillet on top of the meat. Pour 2 tablespoons of soy sauce and 1 teaspoon of sesame oil/garlic powder over top.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Stir-Fry for 3 Minutes",
        instruction: "Toss and stir for 3 minutes until the cabbage wilts slightly but stays crunchy. Spoon into a big bowl and eat!",
        timerSeconds: 180
      }
    ],
    whyItWorks: "You get 3 full servings of vegetables without washing, peeling, or cutting a single thing.",
    rutAlternativeNote: "Tastes just like Chinese takeout egg rolls with 1/4 the sodium and high lean protein."
  }
];
