import { Meal } from "../types";

export const DEFAULT_MEALS: Meal[] = [
  {
    id: "black-bean-salsa-bowl",
    title: "5-Minute Cheesy Fiesta Rice Bowl",
    tagline: "Zesty, warm, and filling—zero chopping and done in 4 minutes.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Microwave Jasmine or White Rice pouch", amount: "1 pouch (ready in 90 sec)", walmartAisle: "Pantry / Canned", tip: "Great Value brand is under $1.50" },
      { item: "Black beans (canned)", amount: "1 can (rinsed & drained)", walmartAisle: "Pantry / Canned" },
      { item: "Salsa of choice", amount: "1/2 cup", walmartAisle: "Pantry / Canned", tip: "Get your favorite jarred salsa" },
      { item: "Shredded Mexican blend cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Guacamole cup or avocado", amount: "1 single-serve mini cup", walmartAisle: "Produce", tip: "Mini cups stay fresh in your fridge" }
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
        instruction: "Spoon 1 mini cup of guacamole right on top and enjoy warm with a spoon or a handful of tortilla chips.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Delivers zesty, cheesy comfort while giving your body 20g of protein and fiber so you stay satisfied for hours.",
    rutAlternativeNote: "A warm, filling bowl you can put together in 4 minutes with zero prep."
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
    rutAlternativeNote: "Swaps instant noodles for real protein and fresh pasta in the exact same time."
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
        instruction: "Preheat your oven to 400°F. Line a large baking sheet with aluminum foil or parchment paper so cleanup takes seconds.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Slice Sausage & Dump Frozen Veggies",
        instruction: "Slice the 1 link of sausage into coin-sized discs using a knife or kitchen shears. Dump the sausage coins and the 1 whole bag of frozen peppers/onions onto the foil-lined pan.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Season & Roast",
        instruction: "Drizzle 2 tablespoons of olive oil over everything, shake on 1 teaspoon of garlic powder/seasoning, and toss. Spread flat and bake for 18 minutes.",
        timerSeconds: 1080
      }
    ],
    whyItWorks: "Frozen veggies keep for months in your freezer, require zero knife skills, and roast alongside savory sausage.",
    rutAlternativeNote: "Gets roasted veggies and protein on your plate with zero washing or chopping."
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
    rutAlternativeNote: "Upgrades frozen pizza night with high-protein chicken and warm flatbread."
  },
  {
    id: "dump-and-heat-chili-mac",
    title: "1-Skillet Creamy Beef & Bean Chili Mac",
    tagline: "Rich, comforting, and packed with 30g protein. Dump 3 pantry items together and stir.",
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
        instruction: "In a medium non-stick skillet over medium heat, dump the 1 can of beef chili, the 1 can of rinsed black beans, and the 1 pouch of pre-cooked rice or pasta.",
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
    rutAlternativeNote: "Takes the exact same time as boxed mac and cheese, with way more protein and staying power."
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
        instruction: "Spoon 1/3 cup of black beans into the opening. Top with 2 tablespoons of salsa or sour cream and 2 tablespoons of cheese.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Complex carbohydrates, vitamin A, and fiber that digest smoothly and keep your energy steady.",
    rutAlternativeNote: "Satisfies savory cravings without needing to touch a stove or wash pots."
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
    whyItWorks: "Zero heat required. Takes just 4 minutes to assemble with clean protein and crisp greens.",
    rutAlternativeNote: "Fresh, crunchy lunch or dinner with zero stove time."
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
        instruction: "Dump the entire 14 oz bag of coleslaw mix right into the skillet on top of the meat. Pour 2 tablespoons of soy sauce and 1 teaspoon of sesame oil/garlic powder over top.",
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
    rutAlternativeNote: "Brings takeout egg roll flavor home in under 10 minutes with extra veggies."
  },
  {
    id: "spinach-egg-quesadilla",
    title: "6-Minute Cheesy Egg & Spinach Quesadilla",
    tagline: "Scramble eggs with a handful of spinach, fold into a cheesy tortilla, and crisp in one pan.",
    prepMinutes: 2,
    cookMinutes: 4,
    category: "one_skillet",
    ingredients: [
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" },
      { item: "Large eggs", amount: "3 eggs", walmartAisle: "Dairy & Eggs" },
      { item: "Baby spinach", amount: "1 big handful", walmartAisle: "Produce" },
      { item: "Shredded cheddar or Mexican blend cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Scramble Eggs & Spinach",
        instruction: "Crack 3 eggs into a greased skillet over medium heat. Toss in 1 big handful of baby spinach and stir with a spatula for 2 minutes until eggs are cooked and spinach is wilted. Scoop onto a plate.",
        timerSeconds: 120
      },
      {
        stepNumber: 2,
        title: "Melt Cheese on Tortilla",
        instruction: "Lay 1 large flour tortilla flat in the same warm skillet. Sprinkle 1/2 cup of shredded cheese and the cooked egg-spinach mix over half of the tortilla.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Fold & Crisp",
        instruction: "Fold the tortilla in half and cook for 1 minute per side until golden and melty. Slice into triangles and enjoy!",
        timerSeconds: 60
      }
    ],
    whyItWorks: "Turns basic breakfast staples into a warm, crispy meal any time of day with hidden greens.",
    rutAlternativeNote: "Uses everyday fridge staples for a hot, protein-rich meal in 6 minutes."
  },
  {
    id: "chicken-black-bean-quesadilla",
    title: "5-Minute Rotisserie Chicken & Bean Quesadilla",
    tagline: "Crisp, melty, and stuffed with pre-cooked chicken and black beans—zero prep required.",
    prepMinutes: 2,
    cookMinutes: 3,
    category: "one_skillet",
    ingredients: [
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" },
      { item: "Rotisserie chicken (shredded)", amount: "1 cup", walmartAisle: "Meat & Deli" },
      { item: "Black beans (canned, rinsed)", amount: "1/2 cup", walmartAisle: "Pantry / Canned" },
      { item: "Shredded Mexican blend cheese", amount: "3/4 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Salsa (for dipping)", amount: "1/4 cup", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Fill the Tortilla",
        instruction: "Place 1 large flour tortilla in a dry skillet over medium heat. Sprinkle 3/4 cup of shredded cheese, 1 cup of shredded rotisserie chicken, and 1/2 cup of rinsed black beans over half of it.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Fold & Crisp Both Sides",
        instruction: "Fold the tortilla in half. Cook for 90 seconds, flip carefully with a spatula, and cook 90 seconds more until golden and melted.",
        timerSeconds: 90
      },
      {
        stepNumber: 3,
        title: "Slice & Dip",
        instruction: "Slide onto a plate, cut into 3 wedges, and dip into 1/4 cup of salsa.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Pre-cooked chicken and canned beans mean zero raw meat handling and over 30g of protein.",
    rutAlternativeNote: "Gives you crispy, melty crunch with real chicken and fiber."
  },
  {
    id: "pasta-marinara-spinach",
    title: "10-Minute One-Pot Pasta, Marinara & Spinach",
    tagline: "Simmer pasta, toss in jarred sauce and a handful of spinach—done in one pot.",
    prepMinutes: 1,
    cookMinutes: 9,
    category: "one_skillet",
    ingredients: [
      { item: "Pasta (penne or rotini)", amount: "2 cups dry", walmartAisle: "Pantry / Canned" },
      { item: "Jarred pasta sauce (marinara)", amount: "1.5 cups", walmartAisle: "Pantry / Canned" },
      { item: "Baby spinach", amount: "2 big handfuls", walmartAisle: "Produce" },
      { item: "Shredded mozzarella or parmesan cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Boil the Pasta",
        instruction: "Boil 2 cups of dry pasta in salted water for 8 minutes until tender, then drain in a colander and return pasta to the warm pot.",
        timerSeconds: 480
      },
      {
        stepNumber: 2,
        title: "Stir in Sauce & Spinach",
        instruction: "Pour 1.5 cups of jarred pasta sauce and 2 big handfuls of baby spinach into the hot pasta. Stir for 1 minute until the spinach wilts and sauce is hot.",
        timerSeconds: 60
      },
      {
        stepNumber: 3,
        title: "Top with Cheese",
        instruction: "Scoop into a bowl and sprinkle 1/3 cup of shredded mozzarella or parmesan on top.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "The hot pasta wilts the spinach automatically—no chopping, no extra pan.",
    rutAlternativeNote: "A classic cozy pasta bowl upgraded with fresh greens in 60 seconds."
  },
  {
    id: "sausage-rice-veggie-skillet",
    title: "7-Minute Smoked Sausage & Rice Skillet",
    tagline: "Brown sliced sausage with frozen veggies, dump in a 90-second rice pouch, and eat.",
    prepMinutes: 2,
    cookMinutes: 5,
    category: "one_skillet",
    ingredients: [
      { item: "Pre-cooked smoked sausage / kielbasa", amount: "1/2 link (sliced)", walmartAisle: "Meat & Deli" },
      { item: "Frozen mixed veggies or broccoli florets", amount: "2 cups", walmartAisle: "Frozen" },
      { item: "Microwave rice pouch", amount: "1 pouch", walmartAisle: "Pantry / Canned" },
      { item: "Soy sauce or garlic butter", amount: "1 tablespoon", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Sear Sausage & Veggies",
        instruction: "Add 1/2 link of sliced smoked sausage and 2 cups of frozen veggies to a skillet over medium-high heat. Cook for 4 minutes, stirring occasionally, until veggies are tender.",
        timerSeconds: 240
      },
      {
        stepNumber: 2,
        title: "Add Rice Pouch & Season",
        instruction: "Tear open 1 pouch of microwave rice (no need to microwave first) and dump it straight into the skillet with 1 tablespoon of soy sauce. Stir for 1 minute until steaming hot.",
        timerSeconds: 60
      },
      {
        stepNumber: 3,
        title: "Serve Warm",
        instruction: "Scoop straight into a bowl. Hearty, savory, and just one pan to rinse.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Uses freezer veggies and pre-cooked rice so nothing spoils and dinner hits the table in 7 minutes.",
    rutAlternativeNote: "A warm, hearty skillet meal faster than waiting for takeout."
  },
  {
    id: "yogurt-berry-granola-bowl",
    title: "2-Minute Greek Yogurt Power Bowl",
    tagline: "No cooking at all—creamy Greek yogurt topped with sweet berries and crunchy granola.",
    prepMinutes: 2,
    cookMinutes: 0,
    category: "assembly",
    ingredients: [
      { item: "Plain or vanilla Greek yogurt", amount: "1 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Frozen or fresh berries", amount: "1/2 cup", walmartAisle: "Frozen" },
      { item: "Granola or crunchy cereal", amount: "1/3 cup", walmartAisle: "Pantry / Canned" },
      { item: "Honey or peanut butter (optional)", amount: "1 tablespoon", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Scoop Yogurt",
        instruction: "Spoon 1 cup of Greek yogurt into your favorite bowl.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Add Berries & Crunch",
        instruction: "Top with 1/2 cup of berries and 1/3 cup of granola. Drizzle 1 tablespoon of honey or peanut butter over top if you'd like.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Delivers 18g+ of protein and probiotics in 2 minutes with zero dishes besides a spoon and bowl.",
    rutAlternativeNote: "Gives you sweet crunch and lasting energy in 2 minutes flat."
  },
  {
    id: "microwave-egg-salsa-tacos",
    title: "4-Minute Microwave Egg & Cheese Tacos",
    tagline: "Yes, you can scramble fluffy eggs in a mug in 90 seconds—wrap in warm tortillas with salsa.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Large eggs", amount: "3 eggs", walmartAisle: "Dairy & Eggs" },
      { item: "Soft flour or corn tortillas", amount: "3 small tortillas", walmartAisle: "Bakery" },
      { item: "Shredded cheddar or Mexican cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Salsa", amount: "3 tablespoons", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Whisk Eggs in a Mug",
        instruction: "Spray a microwave-safe mug or small bowl lightly with cooking spray. Crack 3 eggs in, add a pinch of salt, and whisk with a fork.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Microwave & Stir",
        instruction: "Microwave the 3 whisked eggs for 45 seconds, stir with your fork, then microwave 30-45 seconds more until fluffy and set.",
        timerSeconds: 45
      },
      {
        stepNumber: 3,
        title: "Fill Tortillas & Top",
        instruction: "Warm 3 tortillas for 15 seconds in the microwave, spoon the eggs inside, and top with 1/3 cup shredded cheese and 3 tablespoons salsa.",
        timerSeconds: 15
      }
    ],
    whyItWorks: "No skillet to scrub—just one mug and a fork, plus 20g of warm protein.",
    rutAlternativeNote: "Hot breakfast-for-dinner tacos ready in under 5 minutes."
  },
  {
    id: "turkey-beef-taco-rice-skillet",
    title: "10-Minute Taco Beef & Rice Bowl",
    tagline: "Brown ground turkey or beef with salsa and microwave rice—cheesy, bold, and foolproof.",
    prepMinutes: 2,
    cookMinutes: 8,
    category: "one_skillet",
    ingredients: [
      { item: "Ground beef or ground turkey", amount: "1/2 lb", walmartAisle: "Meat & Deli" },
      { item: "Microwave rice pouch", amount: "1 pouch", walmartAisle: "Pantry / Canned" },
      { item: "Salsa", amount: "1/2 cup", walmartAisle: "Pantry / Canned" },
      { item: "Shredded Mexican blend cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Brown the Ground Meat",
        instruction: "Cook 1/2 lb of ground beef or turkey in a skillet over medium-high heat for 6 minutes, breaking it up with a spoon until browned.",
        timerSeconds: 360
      },
      {
        stepNumber: 2,
        title: "Dump Rice & Salsa",
        instruction: "Tear open 1 pouch of microwave rice and pour it plus 1/2 cup of salsa straight into the skillet. Stir for 2 minutes until bubbling and hot.",
        timerSeconds: 120
      },
      {
        stepNumber: 3,
        title: "Melt Cheese on Top",
        instruction: "Turn off the burner, sprinkle 1/2 cup of shredded cheese on top, and scoop into a bowl once melted.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Salsa acts as both the taco seasoning and the sauce—no spice packets or measuring spoons needed.",
    rutAlternativeNote: "Big, bold taco-night flavor in one pan with just 4 ingredients."
  },
  {
    id: "chicken-veggie-alfredo-pasta",
    title: "10-Minute Creamy Chicken & Veggie Pasta",
    tagline: "Boil pasta with frozen veggies in the same pot, then stir in jarred sauce and rotisserie chicken.",
    prepMinutes: 2,
    cookMinutes: 8,
    category: "one_skillet",
    ingredients: [
      { item: "Pasta (penne or rotini)", amount: "2 cups dry", walmartAisle: "Pantry / Canned" },
      { item: "Frozen broccoli or mixed veggies", amount: "1.5 cups", walmartAisle: "Frozen" },
      { item: "Rotisserie chicken (shredded)", amount: "1 cup", walmartAisle: "Meat & Deli" },
      { item: "Jarred Alfredo or pasta sauce", amount: "1 cup", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Boil Pasta & Frozen Veggies Together",
        instruction: "Boil 2 cups of dry pasta in salted water for 5 minutes. Toss 1.5 cups of frozen veggies into the exact same boiling pot and cook 3 more minutes, then drain.",
        timerSeconds: 480
      },
      {
        stepNumber: 2,
        title: "Stir in Chicken & Sauce",
        instruction: "Dump the drained pasta and veggies back into the warm pot. Stir in 1 cup of shredded rotisserie chicken and 1 cup of jarred Alfredo or pasta sauce for 1 minute until warm.",
        timerSeconds: 60
      }
    ],
    whyItWorks: "Cooking the frozen veggies right inside the pasta water saves you an extra pan and zero chopping.",
    rutAlternativeNote: "Turns pantry pasta into a complete, creamy chicken-and-veggie dinner."
  },
  {
    id: "frozen-meatball-marinara-subs",
    title: "10-Minute Frozen Meatball Marinara Sub",
    tagline: "Heat frozen meatballs right inside jarred pasta sauce, pile on toasted bread, and melt mozzarella.",
    prepMinutes: 2,
    cookMinutes: 8,
    category: "microwave",
    ingredients: [
      { item: "Frozen fully-cooked meatballs", amount: "8 meatballs", walmartAisle: "Frozen", tip: "No thawing needed" },
      { item: "Jarred pasta sauce (marinara)", amount: "1 cup", walmartAisle: "Pantry / Canned" },
      { item: "Hot dog buns, sub rolls, or bread slices", amount: "2 buns or slices", walmartAisle: "Bakery" },
      { item: "Shredded mozzarella cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Meatballs & Sauce",
        instruction: "Put 8 frozen meatballs and 1 cup of jarred marinara sauce in a microwave-safe bowl. Cover loosely with a paper towel and microwave for 3 minutes, stirring halfway.",
        timerSeconds: 180
      },
      {
        stepNumber: 2,
        title: "Fill Buns & Melt Cheese",
        instruction: "Spoon the hot saucy meatballs into 2 buns (or onto 2 pieces of toasted bread). Sprinkle 1/2 cup of shredded mozzarella on top and microwave 30 seconds until melted.",
        timerSeconds: 30
      }
    ],
    whyItWorks: "Meatballs keep in the freezer for months, so you can make a hot sub sandwich anytime with zero prep.",
    rutAlternativeNote: "Gives you warm, cheesy comfort food straight from your freezer."
  },
  {
    id: "freezer-potsticker-broccoli-bowl",
    title: "8-Minute Crispy Potstickers & Broccoli",
    tagline: "Pan-steam frozen dumplings and frozen broccoli together in one skillet with soy or teriyaki sauce.",
    prepMinutes: 1,
    cookMinutes: 7,
    category: "one_skillet",
    ingredients: [
      { item: "Frozen potstickers or dumplings", amount: "8-10 potstickers", walmartAisle: "Frozen" },
      { item: "Frozen broccoli florets", amount: "2 cups", walmartAisle: "Frozen" },
      { item: "Soy sauce or teriyaki sauce", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Cooking oil", amount: "1 tablespoon", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Sear Potstickers & Add Water",
        instruction: "Heat 1 tablespoon of oil in a skillet over medium heat. Place 8-10 frozen potstickers flat-side down, then add 2 cups of frozen broccoli and 1/4 cup of water.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Steam Covered",
        instruction: "Cover the skillet with a lid (or foil) and cook for 5 minutes until the water evaporates and broccoli is tender.",
        timerSeconds: 300
      },
      {
        stepNumber: 3,
        title: "Drizzle Sauce & Eat",
        instruction: "Uncover, let bottoms crisp for 1 minute, then drizzle 2 tablespoons of soy or teriyaki sauce right into the pan and serve.",
        timerSeconds: 60
      }
    ],
    whyItWorks: "Everything comes straight from the freezer and cooks in one covered pan—zero chopping or thawing.",
    rutAlternativeNote: "Tastes like takeout dumplings and veggies in 8 minutes."
  },
  {
    id: "crispy-chicken-tender-caesar-wrap",
    title: "10-Minute Crispy Chicken Caesar Wrap",
    tagline: "Bake or air-fry frozen chicken tenders, toss with a bagged Caesar salad kit, and wrap in a tortilla.",
    prepMinutes: 2,
    cookMinutes: 8,
    category: "assembly",
    ingredients: [
      { item: "Frozen breaded chicken tenders", amount: "3-4 tenders", walmartAisle: "Frozen" },
      { item: "Bagged Caesar salad kit", amount: "1/2 bag (with dressing)", walmartAisle: "Produce", tip: "Comes with dressing & parmesan" },
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Cook Frozen Chicken Tenders",
        instruction: "Air-fry 3-4 frozen chicken tenders at 380°F for 8 minutes (or microwave 2 minutes if in a hurry) until hot.",
        timerSeconds: 480
      },
      {
        stepNumber: 2,
        title: "Toss Bagged Salad",
        instruction: "Dump 1/2 bag of Caesar salad greens, dressing packet, and cheese packet into a bowl and toss with a fork.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Wrap & Eat",
        instruction: "Lay 2 large tortillas flat, pile the dressed salad and hot chicken tenders in the center, fold the sides in, and roll up.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Only 3 items to buy at Walmart, and the salad kit includes all the dressing and cheese.",
    rutAlternativeNote: "Crunchy, restaurant-style wrap using freezer tenders and a pre-washed salad bag."
  },
  {
    id: "frozen-shrimp-garlic-rice-bowl",
    title: "7-Minute Garlic Shrimp & Rice Bowl",
    tagline: "Frozen cooked shrimp warms up in 3 minutes—pair with a rice pouch and steam-in-bag veggies.",
    prepMinutes: 1,
    cookMinutes: 6,
    category: "one_skillet",
    ingredients: [
      { item: "Frozen pre-cooked shrimp (peeled)", amount: "1.5 cups", walmartAisle: "Frozen" },
      { item: "Microwave rice pouch", amount: "1 pouch", walmartAisle: "Pantry / Canned" },
      { item: "Frozen veggies (peas, carrots, or broccoli)", amount: "1.5 cups", walmartAisle: "Frozen" },
      { item: "Butter or garlic butter", amount: "1 tablespoon", walmartAisle: "Dairy & Eggs" },
      { item: "Soy sauce or lemon juice", amount: "1 tablespoon", walmartAisle: "Spices & Condiments" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Warm Shrimp & Frozen Veggies",
        instruction: "Melt 1 tablespoon of butter in a skillet over medium heat. Toss in 1.5 cups of frozen cooked shrimp and 1.5 cups of frozen veggies and cook for 4 minutes until hot.",
        timerSeconds: 240
      },
      {
        stepNumber: 2,
        title: "Stir in Rice Pouch & Sauce",
        instruction: "Dump 1 pouch of microwave rice and 1 tablespoon of soy sauce (or lemon juice) into the skillet. Stir for 2 minutes until steaming.",
        timerSeconds: 120
      }
    ],
    whyItWorks: "Pre-cooked frozen shrimp thaws straight in the pan in minutes and packs lean protein.",
    rutAlternativeNote: "Feels fresh and satisfying while relying 100% on freezer and pantry staples."
  },
  {
    id: "creamy-tuna-toast-melt",
    title: "5-Minute Creamy Tuna Toast Melt",
    tagline: "Mix canned tuna with Greek yogurt or mayo, pile on toast with cheese, and melt.",
    prepMinutes: 3,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Canned tuna in water (drained)", amount: "1 can (5 oz)", walmartAisle: "Pantry / Canned" },
      { item: "Plain Greek yogurt or mayonnaise", amount: "2 tablespoons", walmartAisle: "Dairy & Eggs" },
      { item: "Bread or English muffins", amount: "2 slices or 1 muffin", walmartAisle: "Bakery" },
      { item: "Shredded cheddar cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Mix Tuna Salad",
        instruction: "Drain 1 can of tuna and stir it in a small bowl with 2 tablespoons of Greek yogurt (or mayo) and a pinch of salt and pepper.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Toast Bread & Top",
        instruction: "Toast 2 slices of bread (or 1 split English muffin). Spoon the tuna mix on top and sprinkle with 1/3 cup of shredded cheddar cheese.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Melt Cheese",
        instruction: "Microwave for 30 seconds or pop under a toaster oven broiler for 90 seconds until cheese is melted.",
        timerSeconds: 30
      }
    ],
    whyItWorks: "Canned tuna sits in your pantry for years and gives 25g+ protein in under 5 minutes.",
    rutAlternativeNote: "A warm, crispy diner-style melt using basic pantry staples."
  },
  {
    id: "upgraded-peanut-ramen",
    title: "6-Minute Upgraded Peanut Ramen with Egg & Peas",
    tagline: "Keep the cozy noodle convenience—stir in peanut butter, frozen veggies, and an egg for real staying power.",
    prepMinutes: 1,
    cookMinutes: 5,
    category: "one_skillet",
    ingredients: [
      { item: "Ramen noodles (discard or use half seasoning)", amount: "1 pack", walmartAisle: "Pantry / Canned" },
      { item: "Frozen peas or mixed veggies", amount: "1 cup", walmartAisle: "Frozen" },
      { item: "Egg", amount: "1 egg", walmartAisle: "Dairy & Eggs" },
      { item: "Peanut butter", amount: "1 tablespoon", walmartAisle: "Pantry / Canned" },
      { item: "Soy sauce", amount: "1 tablespoon", walmartAisle: "Spices & Condiments" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Boil Noodles & Frozen Veggies",
        instruction: "Bring 1.5 cups of water to a boil in a small pot. Add 1 pack of ramen noodles and 1 cup of frozen peas/veggies and boil for 3 minutes.",
        timerSeconds: 180
      },
      {
        stepNumber: 2,
        title: "Swirl in Egg",
        instruction: "Crack 1 egg directly into the simmering broth and stir gently with a fork for 1 minute until cooked ribbons form.",
        timerSeconds: 60
      },
      {
        stepNumber: 3,
        title: "Stir in Peanut Butter & Soy Sauce",
        instruction: "Turn off heat. Stir in 1 tablespoon of peanut butter and 1 tablespoon of soy sauce until creamy and glossy.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Turns an ordinary ramen pack into a creamy Thai-style noodle bowl with protein and veggies.",
    rutAlternativeNote: "Gives instant noodle comfort while keeping you full for hours."
  },
  {
    id: "tomato-soup-crispy-grilled-cheese",
    title: "7-Minute Tomato Soup & Easy Grilled Cheese",
    tagline: "Warm canned soup in a mug while a buttery cheddar sandwich crisps in a pan.",
    prepMinutes: 2,
    cookMinutes: 5,
    category: "one_skillet",
    ingredients: [
      { item: "Canned tomato soup", amount: "1 can", walmartAisle: "Pantry / Canned" },
      { item: "Bread slices", amount: "2 slices", walmartAisle: "Bakery" },
      { item: "Shredded or sliced cheddar cheese", amount: "1/2 cup or 2 slices", walmartAisle: "Dairy & Eggs" },
      { item: "Butter", amount: "1 tablespoon", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Tomato Soup",
        instruction: "Pour 1 can of tomato soup into a large microwave-safe bowl (add water/milk only if condensed). Cover with a paper towel and microwave for 2 minutes.",
        timerSeconds: 120
      },
      {
        stepNumber: 2,
        title: "Make Grilled Cheese",
        instruction: "Spread 1 tablespoon of butter on the outside of 2 slices of bread with 1/2 cup cheese inside. Cook in a warm skillet for 2 minutes per side until golden.",
        timerSeconds: 240
      }
    ],
    whyItWorks: "Classic zero-stress comfort dinner made from shelf-stable soup and basic fridge staples.",
    rutAlternativeNote: "Warm, crispy comfort food with almost zero mental load."
  },
  {
    id: "hashbrown-egg-bacon-skillet",
    title: "9-Minute Crispy Hashbrown & Egg Skillet",
    tagline: "Crisp frozen hashbrowns in one pan, crack eggs right on top, and sprinkle with cheese and bacon bits.",
    prepMinutes: 1,
    cookMinutes: 8,
    category: "one_skillet",
    ingredients: [
      { item: "Frozen shredded hashbrowns or tater tots", amount: "2 cups", walmartAisle: "Frozen" },
      { item: "Large eggs", amount: "2-3 eggs", walmartAisle: "Dairy & Eggs" },
      { item: "Pre-cooked bacon slices or bacon bits", amount: "2 tablespoons", walmartAisle: "Meat & Deli" },
      { item: "Shredded cheddar cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Crisp Frozen Hashbrowns",
        instruction: "Spray or oil a skillet over medium-high heat. Pour in 2 cups of frozen hashbrowns and cook untouched for 4 minutes, then flip and cook 2 minutes more.",
        timerSeconds: 360
      },
      {
        stepNumber: 2,
        title: "Add Eggs & Cheese",
        instruction: "Crack 2-3 eggs right over the hashbrowns, sprinkle 1/3 cup cheddar cheese and 2 tablespoons pre-cooked bacon on top, cover with a lid, and cook 2-3 minutes until eggs set.",
        timerSeconds: 150
      }
    ],
    whyItWorks: "Breakfast-for-dinner in one pan using freezer potatoes and pre-cooked bacon.",
    rutAlternativeNote: "Salty, crispy diner skillet ready in under 10 minutes."
  },
  {
    id: "english-muffin-mini-pizzas",
    title: "6-Minute English Muffin Mini Pizzas",
    tagline: "Halved English muffins topped with marinara and mozzarella—crisp in toaster oven or air fryer.",
    prepMinutes: 2,
    cookMinutes: 4,
    category: "assembly",
    ingredients: [
      { item: "English muffins", amount: "2 muffins (split into 4 halves)", walmartAisle: "Bakery" },
      { item: "Jarred pasta sauce (marinara)", amount: "1/2 cup", walmartAisle: "Pantry / Canned" },
      { item: "Shredded mozzarella cheese", amount: "3/4 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Pre-cooked bacon or sliced deli meat (optional)", amount: "1/3 cup", walmartAisle: "Meat & Deli" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Top Muffin Halves",
        instruction: "Split 2 English muffins into 4 halves on a foil-lined tray. Spoon 2 tablespoons of marinara sauce onto each half.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Add Cheese & Bake",
        instruction: "Sprinkle 3/4 cup shredded mozzarella and optional meat over the halves. Bake or air-fry at 375°F for 4-5 minutes until bubbly and crisp.",
        timerSeconds: 240
      }
    ],
    whyItWorks: "Portioned in minutes with zero dough prep and crispy edges every time.",
    rutAlternativeNote: "Instant personal pizzas using bakery staples and jarred sauce."
  },
  {
    id: "chickpea-pesto-warm-bowl",
    title: "4-Minute Chickpea & Pesto Warm Bowl",
    tagline: "Rinse canned chickpeas, warm with jarred pesto and spinach, and top with feta or mozzarella.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Canned chickpeas (garbanzo beans, drained)", amount: "1 can", walmartAisle: "Pantry / Canned" },
      { item: "Jarred basil pesto", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Baby spinach", amount: "2 handfuls", walmartAisle: "Produce" },
      { item: "Shredded parmesan or mozzarella", amount: "1/4 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Warm Chickpeas & Spinach",
        instruction: "Dump 1 drained can of chickpeas and 2 handfuls of baby spinach into a microwave-safe bowl. Microwave for 90 seconds until hot and spinach wilts.",
        timerSeconds: 90
      },
      {
        stepNumber: 2,
        title: "Stir in Pesto & Cheese",
        instruction: "Stir in 2 tablespoons of jarred pesto and top with 1/4 cup of shredded parmesan or mozzarella.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Shelf-stable chickpeas give 15g+ protein and fiber with zero stove cleanup.",
    rutAlternativeNote: "Savory Mediterranean bowl in 4 minutes from just 4 ingredients."
  },
  {
    id: "deli-turkey-hummus-rollups",
    title: "3-Minute Turkey & Hummus Roll-Ups with Carrots",
    tagline: "Zero heat required—spread hummus on tortillas, layer deli turkey and spinach, roll and slice.",
    prepMinutes: 3,
    cookMinutes: 0,
    category: "assembly",
    ingredients: [
      { item: "Deli turkey or ham slices", amount: "4-6 slices", walmartAisle: "Meat & Deli" },
      { item: "Hummus (any flavor)", amount: "3 tablespoons", walmartAisle: "Meat & Deli" },
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" },
      { item: "Baby spinach", amount: "1 handful", walmartAisle: "Produce" },
      { item: "Baby carrots (on the side)", amount: "1 handful", walmartAisle: "Produce" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Spread Hummus",
        instruction: "Lay 2 large tortillas flat on a plate. Spread 1.5 tablespoons of hummus onto each tortilla.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Layer & Roll",
        instruction: "Place 2-3 slices of deli turkey and a small handful of baby spinach on each tortilla. Roll up tightly, slice in half, and eat with a handful of baby carrots.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "No cooking, no pots, no mess—just clean protein, fiber, and crunch in 3 minutes.",
    rutAlternativeNote: "Fast, fresh lunch or low-energy dinner when you don't want to cook."
  },
  {
    id: "baked-frozen-salmon-green-beans",
    title: "14-Minute Sheet-Pan Frozen Salmon & Broccoli",
    tagline: "Roast a frozen salmon fillet straight from the freezer next to frozen broccoli with garlic butter.",
    prepMinutes: 2,
    cookMinutes: 12,
    category: "sheet_pan",
    ingredients: [
      { item: "Frozen salmon fillets", amount: "1-2 fillets", walmartAisle: "Frozen" },
      { item: "Frozen broccoli florets", amount: "2 cups", walmartAisle: "Frozen" },
      { item: "Butter or olive oil", amount: "1 tablespoon", walmartAisle: "Dairy & Eggs" },
      { item: "Garlic powder or lemon pepper", amount: "1 teaspoon", walmartAisle: "Spices & Condiments" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Prep Foil Pan",
        instruction: "Preheat oven or air fryer to 400°F. Line a tray with foil. Put 1-2 frozen salmon fillets and 2 cups frozen broccoli on the foil.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Season & Bake",
        instruction: "Top salmon and broccoli with 1 tablespoon butter (or oil) and 1 teaspoon garlic powder or lemon pepper. Bake 12-14 minutes until salmon flakes easily with a fork.",
        timerSeconds: 780
      }
    ],
    whyItWorks: "Frozen fish fillets cook straight from frozen on foil—omega-3 rich dinner with zero cleanup.",
    rutAlternativeNote: "Restaurant-quality salmon dinner straight from your freezer."
  },
  {
    id: "peanut-butter-banana-oatmeal",
    title: "3-Minute Peanut Butter Berry Oatmeal",
    tagline: "Microwave rolled oats with water or milk, swirl in peanut butter, and top with frozen berries.",
    prepMinutes: 1,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Rolled oats or instant oatmeal", amount: "1/2 cup", walmartAisle: "Pantry / Canned" },
      { item: "Peanut butter", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Frozen berries", amount: "1/2 cup", walmartAisle: "Frozen" },
      { item: "Granola (optional crunch)", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Oats & Berries",
        instruction: "Put 1/2 cup of rolled oats, 1 cup of water (or milk), and 1/2 cup of frozen berries in a large microwave-safe bowl. Microwave on HIGH for 2 minutes.",
        timerSeconds: 120
      },
      {
        stepNumber: 2,
        title: "Swirl in Peanut Butter",
        instruction: "Stir 2 tablespoons of peanut butter right into the hot oats until melted and creamy. Top with 2 tablespoons granola for crunch.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Uses 100% pantry and freezer staples—warm, filling fiber and healthy fats in 3 minutes.",
    rutAlternativeNote: "Cozy, sweet-and-nutty bowl ready faster than toast."
  },
  {
    id: "waffle-egg-cheese-sandwich",
    title: "4-Minute Crispy Waffle Breakfast Sandwich",
    tagline: "Toast two frozen waffles, microwave a quick scrambled egg in a mug, and stack with cheddar.",
    prepMinutes: 1,
    cookMinutes: 3,
    category: "microwave",
    ingredients: [
      { item: "Frozen waffles", amount: "2 waffles", walmartAisle: "Frozen" },
      { item: "Large eggs", amount: "2 eggs", walmartAisle: "Dairy & Eggs" },
      { item: "Shredded or sliced cheddar cheese", amount: "1/4 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Pre-cooked bacon slices (optional)", amount: "2 slices", walmartAisle: "Meat & Deli" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Toast Waffles & Microwave Egg",
        instruction: "Pop 2 frozen waffles in the toaster. Meanwhile, whisk 2 eggs in a lightly greased small bowl and microwave for 60-75 seconds until set.",
        timerSeconds: 75
      },
      {
        stepNumber: 2,
        title: "Stack & Eat",
        instruction: "Slide the hot egg onto one toasted waffle, top with 1/4 cup cheddar cheese (and 2 pre-cooked bacon slices if desired), and cap with the second waffle.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Sweet-and-savory handheld sandwich from freezer waffles and eggs with zero pans to wash.",
    rutAlternativeNote: "Fast drive-thru style sandwich made from freezer and fridge staples."
  }
];
