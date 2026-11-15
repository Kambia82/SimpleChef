import { Meal } from "../types";

export const DEFAULT_MEALS: Meal[] = [
  {
    id: "dorm-buffalo-chicken-ranch-wrap",
    title: "3-Minute Buffalo Chicken & Ranch Wrap",
    tagline: "Zero cooking needed—spicy buffalo chicken, ranch, shredded cheese, and crisp lettuce rolled in a tortilla.",
    prepMinutes: 3,
    cookMinutes: 0,
    category: "assembly",
    ingredients: [
      { item: "Pre-cooked grilled chicken strips (or tear-open chicken pouch)", amount: "1 cup", walmartAisle: "Meat & Deli", tip: "Found in the refrigerated deli meat section" },
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" },
      { item: "Buffalo wing sauce", amount: "2 tablespoons", walmartAisle: "Spices & Condiments" },
      { item: "Ranch dressing", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Shredded cheddar cheese & bagged shredded lettuce", amount: "1/3 cup cheese + 1 handful lettuce", walmartAisle: "Produce" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Toss Chicken in Buffalo Sauce",
        instruction: "Put 1 cup of pre-cooked grilled chicken strips in a bowl and toss with 2 tablespoons of buffalo wing sauce using a fork (or microwave 30 seconds if you want the chicken warm).",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Layer Tortillas with Cheese & Ranch",
        instruction: "Lay 2 large flour tortillas flat on a plate. Drizzle 1 tablespoon of ranch dressing down the center of each tortilla and sprinkle 1/3 cup total shredded cheddar cheese over both.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Add Buffalo Chicken, Lettuce & Roll",
        instruction: "Split the buffalo chicken and 1 handful of shredded lettuce between both tortillas, fold the sides in, and roll up tightly like burritos.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Hits the exact takeout buffalo wrap craving in 3 minutes flat with 30g+ of protein and zero pans to clean.",
    rutAlternativeNote: "Replaces drive-thru wraps or plain snacks with a spicy, filling, high-protein dorm meal."
  },
  {
    id: "dorm-pepperoni-pizza-quesadilla",
    title: "3-Minute Microwave Pepperoni Pizza Quesadilla",
    tagline: "Melted mozzarella, pepperoni, and marinara folded in a tortilla—microwave 60 seconds on a paper plate.",
    prepMinutes: 2,
    cookMinutes: 1,
    category: "microwave",
    ingredients: [
      { item: "Large flour tortilla", amount: "1-2 tortillas", walmartAisle: "Bakery" },
      { item: "Shredded mozzarella cheese", amount: "3/4 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Sliced pepperoni", amount: "12-15 slices", walmartAisle: "Meat & Deli", tip: "Shelf-stable bags work until opened" },
      { item: "Jarred pizza sauce or marinara", amount: "3 tablespoons", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Spread Sauce & Cheese on Half",
        instruction: "Lay 1 large flour tortilla flat on a microwave-safe plate. Spread 3 tablespoons of pizza or marinara sauce on one half, then pile on 3/4 cup shredded mozzarella cheese and 12-15 slices of pepperoni.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Fold & Microwave Until Melty",
        instruction: "Fold the empty half of the tortilla over the toppings and press down lightly. Microwave on HIGH for 60 to 75 seconds until the mozzarella is completely melted.",
        timerSeconds: 60
      },
      {
        stepNumber: 3,
        title: "Cool 30 Seconds & Eat",
        instruction: "Let cool 30 seconds so the melted cheese sets slightly, cut into triangles with a butter knife or fold in half, and eat.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Tastes like hot pizza night for a fraction of delivery cost, with zero soggy bread or dirty dishes.",
    rutAlternativeNote: "Satisfies late-night pizza cravings in 3 minutes using only a dorm microwave."
  },
  {
    id: "dorm-bacon-egg-breakfast-burrito",
    title: "4-Minute Cheesy Bacon & Egg Breakfast Burrito",
    tagline: "Scramble eggs in a mug in 75 seconds, dump in pre-cooked bacon and cheddar, and wrap in a warm tortilla.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Large eggs", amount: "3 eggs", walmartAisle: "Dairy & Eggs" },
      { item: "Pre-cooked bacon slices or real bacon bits", amount: "3 slices (or 3 tablespoons bits)", walmartAisle: "Meat & Deli" },
      { item: "Shredded cheddar or Mexican blend cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Large flour tortillas", amount: "1-2 tortillas", walmartAisle: "Bakery" },
      { item: "Salsa or hot sauce", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Scramble Eggs in a Mug",
        instruction: "Lightly spray or butter a microwave-safe mug or bowl. Crack in 3 large eggs, add a pinch of salt, and beat with a fork. Microwave 45 seconds, stir, then microwave 30 seconds more until cooked.",
        timerSeconds: 75
      },
      {
        stepNumber: 2,
        title: "Melt Cheese & Add Bacon",
        instruction: "Drop 1/3 cup of shredded cheddar cheese and 3 torn pre-cooked bacon slices (or 3 tablespoons bacon bits) directly onto the hot eggs in the mug and stir.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Wrap in Warm Tortilla",
        instruction: "Warm 1-2 large flour tortillas on a plate for 15 seconds, scoop the cheesy bacon eggs inside, top with 2 tablespoons salsa or hot sauce, and roll up tightly.",
        timerSeconds: 15
      }
    ],
    whyItWorks: "Packs 28g+ of real protein into a handheld burrito you can grab before class or after the gym.",
    rutAlternativeNote: "Faster and way cheaper than a fast-food breakfast run with just one mug to rinse."
  },
  {
    id: "black-bean-salsa-bowl",
    title: "5-Minute Cheesy Fiesta Rice & Bean Bowl",
    tagline: "Zesty, warm, and filling—zero chopping and done in 4 minutes.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Microwave Jasmine or White Rice pouch", amount: "1 pouch (ready in 90 sec)", walmartAisle: "Pantry / Canned", tip: "Great Value brand is under $1.50" },
      { item: "Black beans (canned)", amount: "1 can (rinsed & drained)", walmartAisle: "Pantry / Canned" },
      { item: "Salsa of choice", amount: "1/2 cup", walmartAisle: "Pantry / Canned", tip: "Get your favorite jarred salsa" },
      { item: "Shredded Mexican blend cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Guacamole cup or tortilla chips", amount: "1 mini cup (or handful of chips)", walmartAisle: "Produce", tip: "Mini cups stay fresh in a mini-fridge" }
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
        title: "Drain & Add the Beans",
        instruction: "Open 1 can of black beans, drain out the liquid (rinse if you have a sink), and dump half to all the beans into a microwave-safe bowl.",
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
        title: "Top & Scoop",
        instruction: "Spoon 1 mini cup of guacamole right on top and eat warm with a spoon or crush a handful of tortilla chips on top.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Delivers zesty, cheesy Chipotle-bowl vibes while giving your body 20g of protein and fiber in 4 minutes.",
    rutAlternativeNote: "Turns plain chips and salsa into a real hot burrito bowl."
  },
  {
    id: "dorm-teriyaki-chicken-rice-bowl",
    title: "4-Minute Microwave Teriyaki Chicken & Rice Bowl",
    tagline: "Tastes like takeout teriyaki chicken bowls—90-second rice pouch, pre-cooked chicken, steam-in-bag broccoli, and sauce.",
    prepMinutes: 1,
    cookMinutes: 3,
    category: "microwave",
    ingredients: [
      { item: "Microwave Jasmine or White Rice pouch", amount: "1 pouch", walmartAisle: "Pantry / Canned" },
      { item: "Pre-cooked grilled chicken strips (or tear-open chicken pouch)", amount: "1 cup", walmartAisle: "Meat & Deli" },
      { item: "Teriyaki sauce", amount: "3 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Steam-in-bag frozen broccoli florets", amount: "1/2 bag (about 1.5 cups)", walmartAisle: "Frozen", tip: "Steams right inside its bag in the microwave" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Steam Broccoli & Heat Rice",
        instruction: "Microwave 1/2 to 1 bag of steam-in-bag frozen broccoli according to the bag (about 3 minutes) or microwave 1 pouch of rice for 90 seconds first, then the broccoli.",
        timerSeconds: 180
      },
      {
        stepNumber: 2,
        title: "Warm Chicken & Sauce",
        instruction: "Pour the hot microwaved rice and 1.5 cups of steamed broccoli into a deep bowl. Top with 1 cup of pre-cooked chicken strips and drizzle with 3 tablespoons of teriyaki sauce.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Quick Heat & Stir",
        instruction: "Microwave the bowl for 45 seconds so the chicken and sauce are steaming hot, stir once, and eat.",
        timerSeconds: 45
      }
    ],
    whyItWorks: "Over 30g protein, filling rice, and real veggies with zero cutting board or pans.",
    rutAlternativeNote: "Replaces pricey takeout bowls with a 4-minute dorm microwave version."
  },
  {
    id: "dorm-chili-rice-cheese-bowl",
    title: "4-Minute Dorm Beef Chili & Cheese Rice Bowl",
    tagline: "100% shelf-stable pantry meal—microwave canned beef chili over a 90-second rice pouch with melted cheddar.",
    prepMinutes: 1,
    cookMinutes: 3,
    category: "microwave",
    ingredients: [
      { item: "Canned beef chili with beans (pull-tab)", amount: "1 can (15 oz)", walmartAisle: "Pantry / Canned" },
      { item: "Microwave rice pouch", amount: "1 pouch", walmartAisle: "Pantry / Canned" },
      { item: "Shredded cheddar cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Tortilla chips or Fritos (optional crunch)", amount: "1 handful", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave the Rice Pouch",
        instruction: "Tear a 2-inch vent in 1 pouch of microwave rice and heat on HIGH for 90 seconds.",
        timerSeconds: 90
      },
      {
        stepNumber: 2,
        title: "Heat Chili in a Deep Bowl",
        instruction: "Pour the hot rice into a deep microwave-safe bowl. Open 1 can of beef chili and spoon it right over the rice. Cover loosely with a paper towel and microwave 90 seconds until hot.",
        timerSeconds: 90
      },
      {
        stepNumber: 3,
        title: "Top with Cheese & Chips",
        instruction: "Sprinkle 1/2 cup shredded cheddar cheese on top so it melts into the hot chili, then crush a handful of tortilla chips on top if you want crunch.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "No freezer needed, keeps for months in a dorm closet, and delivers 30g+ protein after late classes or workouts.",
    rutAlternativeNote: "Hearty, filling hot bowl made purely in a shared dorm microwave."
  },
  {
    id: "dorm-loaded-chicken-nachos",
    title: "3-Minute Loaded Chicken & Queso Nachos",
    tagline: "Real protein nachos on one plate—tortilla chips, pre-cooked chicken, black beans, and melted cheese or queso.",
    prepMinutes: 2,
    cookMinutes: 1,
    category: "microwave",
    ingredients: [
      { item: "Tortilla chips", amount: "2 big handfuls", walmartAisle: "Pantry / Canned" },
      { item: "Pre-cooked shredded or diced chicken (or pouch chicken)", amount: "3/4 cup", walmartAisle: "Meat & Deli" },
      { item: "Shredded Mexican cheese (or jarred queso)", amount: "3/4 cup cheese (or 1/3 cup queso)", walmartAisle: "Dairy & Eggs" },
      { item: "Canned black beans (drained)", amount: "1/3 cup", walmartAisle: "Pantry / Canned" },
      { item: "Salsa or mini guacamole cup", amount: "1/4 cup", walmartAisle: "Produce" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Load Up the Plate",
        instruction: "Spread 2 big handfuls of tortilla chips across a large microwave-safe plate. Scatter 3/4 cup pre-cooked chicken, 1/3 cup drained black beans, and 3/4 cup shredded cheese (or 1/3 cup queso) evenly on top.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Microwave to Melt",
        instruction: "Microwave on HIGH for 45 to 60 seconds until the cheese is melted and bubbly.",
        timerSeconds: 60
      },
      {
        stepNumber: 3,
        title: "Top with Salsa or Guac",
        instruction: "Spoon 1/4 cup of salsa or a mini guacamole cup right over the hot nachos and eat straight off the plate.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Turns a bag of chips into a legit high-protein dinner with zero extra dishes.",
    rutAlternativeNote: "Upgrades plain chips and salsa into 25g+ protein loaded nachos in 3 minutes."
  },
  {
    id: "dorm-turkey-bacon-club-wrap",
    title: "3-Minute Turkey, Bacon & Cheddar Club Wrap",
    tagline: "Zero microwave required—deli turkey, pre-cooked bacon, cheddar, shredded lettuce, and ranch rolled in a tortilla.",
    prepMinutes: 3,
    cookMinutes: 0,
    category: "assembly",
    ingredients: [
      { item: "Deli turkey or ham slices", amount: "5-6 slices", walmartAisle: "Meat & Deli" },
      { item: "Pre-cooked bacon slices", amount: "3 slices", walmartAisle: "Meat & Deli" },
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" },
      { item: "Shredded cheddar cheese & ranch dressing", amount: "1/3 cup cheese + 2 tbsp ranch", walmartAisle: "Dairy & Eggs" },
      { item: "Bagged shredded lettuce or salad greens", amount: "1 handful", walmartAisle: "Produce" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Spread Ranch & Cheese",
        instruction: "Lay 2 large flour tortillas flat on a plate. Spread 1 tablespoon of ranch dressing down the middle of each tortilla and sprinkle 1/3 cup total shredded cheddar cheese.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Stack Turkey, Bacon & Lettuce",
        instruction: "Layer 2-3 slices of deli turkey, 1.5 pre-cooked bacon slices, and half of 1 handful of shredded lettuce onto each tortilla.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Roll Tight & Eat",
        instruction: "Fold the ends in, roll each tortilla tightly like a deli wrap, slice in half if desired, and eat immediately.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Tastes like a deli sub shop club wrap with zero microwave line, zero freezer needed, and 25g+ protein.",
    rutAlternativeNote: "Fast, crunchy, cold protein wrap when you want real food in 3 minutes."
  },
  {
    id: "dorm-chili-cheese-mac-bowl",
    title: "5-Minute Dorm Chili Cheese Mac Bowl",
    tagline: "Cook quick elbow pasta or a mac cup right in a microwave bowl, stir in canned beef chili and cheddar—mega comfort.",
    prepMinutes: 1,
    cookMinutes: 4,
    category: "microwave",
    ingredients: [
      { item: "Quick-cooking elbow macaroni (or 1 microwave mac & cheese cup)", amount: "1 cup dry (or 1 cup)", walmartAisle: "Pantry / Canned" },
      { item: "Canned beef chili with beans", amount: "1/2 to 1 can", walmartAisle: "Pantry / Canned" },
      { item: "Shredded cheddar cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Pasta in Bowl",
        instruction: "Put 1 cup dry elbow macaroni, 1.25 cups cold tap water, and a pinch of salt in a large deep microwave bowl (or cook 1 mac & cheese cup per its package). Microwave 2 minutes, stir, and microwave 2 minutes more until tender.",
        timerSeconds: 120
      },
      {
        stepNumber: 2,
        title: "Stir in Beef Chili & Cheese",
        instruction: "Pour off any extra water if using dry macaroni. Spoon 1/2 to 1 can of beef chili and 1/2 cup shredded cheddar cheese straight into the hot bowl and stir.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Heat Through & Eat",
        instruction: "Cover loosely with a paper towel and microwave 60 seconds until the chili is piping hot and cheese is melted.",
        timerSeconds: 60
      }
    ],
    whyItWorks: "Turns basic mac & cheese into a 30g-protein comfort bowl using only shelf-stable items and cheese.",
    rutAlternativeNote: "Massive upgrade over plain boxed mac & cheese in the exact same time."
  },
  {
    id: "dorm-cheesy-garlic-chicken-ramen",
    title: "5-Minute Cheesy Egg & Chicken Dorm Ramen",
    tagline: "Cook noodles in a deep microwave bowl—no kettle or stove—then stir in a soft egg, shredded chicken, and cheddar.",
    prepMinutes: 1,
    cookMinutes: 4,
    category: "microwave",
    ingredients: [
      { item: "Ramen noodle packet (chicken or spicy flavor)", amount: "1 packet", walmartAisle: "Pantry / Canned" },
      { item: "Large egg", amount: "1 egg", walmartAisle: "Dairy & Eggs" },
      { item: "Tear-open chicken pouch or shredded rotisserie chicken", amount: "1/2 cup", walmartAisle: "Meat & Deli" },
      { item: "Shredded cheddar or American cheese", amount: "1/3 cup (or 1 slice)", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Noodles in Deep Bowl",
        instruction: "Put 1 ramen noodle brick and 1.5 cups cold tap water in a large deep microwave-safe bowl (save the seasoning packet for step 3). Microwave 3 minutes, flip noodles, and microwave 1 more minute until tender.",
        timerSeconds: 180
      },
      {
        stepNumber: 2,
        title: "Swirl in Egg & Chicken",
        instruction: "Pour off half the hot water so just a little broth stays at the bottom. Crack 1 egg straight into the bowl, add 1/2 cup chicken, stir briskly with a fork, and microwave 35 seconds to cook the egg.",
        timerSeconds: 35
      },
      {
        stepNumber: 3,
        title: "Melt Cheese & Seasoning",
        instruction: "Stir in half to all of the seasoning packet and 1/3 cup shredded cheese (or 1 cheese slice) until rich, creamy, and savory.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Turns 30-cent ramen into a rich, cheesy, 28g-protein noodle bowl without a stove or kettle.",
    rutAlternativeNote: "Upgrades plain dorm ramen with real egg and chicken so you aren't hungry an hour later."
  },
  {
    id: "frozen-meatball-marinara-subs",
    title: "5-Minute Meatball & Mozzarella Sub",
    tagline: "Microwave frozen meatballs right inside jarred pasta sauce, pile into sub rolls, and melt mozzarella on top.",
    prepMinutes: 1,
    cookMinutes: 4,
    category: "microwave",
    ingredients: [
      { item: "Frozen fully-cooked meatballs", amount: "8 meatballs", walmartAisle: "Frozen", tip: "No thawing needed" },
      { item: "Jarred pasta sauce (marinara)", amount: "1 cup", walmartAisle: "Pantry / Canned" },
      { item: "Sub rolls, hot dog buns, or hoagie buns", amount: "2 rolls or buns", walmartAisle: "Bakery" },
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
        instruction: "Spoon the hot saucy meatballs into 2 sub rolls or hot dog buns on a plate. Sprinkle 1/2 cup of shredded mozzarella on top and microwave 30 seconds until melted.",
        timerSeconds: 30
      }
    ],
    whyItWorks: "Meatballs keep in a freezer for months, so you can make two hot meatball subs in 5 minutes flat.",
    rutAlternativeNote: "Gives you warm, cheesy pizzeria subs without spending $15 on delivery."
  },
  {
    id: "crispy-chicken-tender-caesar-wrap",
    title: "4-Minute Crispy Chicken Caesar Wrap",
    tagline: "Microwave frozen chicken tenders, toss with a bagged Caesar salad kit, and roll inside big tortillas.",
    prepMinutes: 2,
    cookMinutes: 2,
    category: "assembly",
    ingredients: [
      { item: "Frozen breaded chicken tenders or nuggets", amount: "3-4 tenders", walmartAisle: "Frozen" },
      { item: "Bagged Caesar salad kit", amount: "1/2 bag (with dressing)", walmartAisle: "Produce", tip: "Comes with dressing & parmesan" },
      { item: "Large flour tortillas", amount: "2 tortillas", walmartAisle: "Bakery" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Chicken Tenders",
        instruction: "Place 3-4 frozen chicken tenders on a microwave-safe plate lined with a paper towel and microwave for 2 minutes until hot.",
        timerSeconds: 120
      },
      {
        stepNumber: 2,
        title: "Toss Bagged Salad",
        instruction: "Dump 1/2 bag of Caesar salad greens, the dressing packet, and parmesan packet into a bowl and toss with a fork.",
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
    rutAlternativeNote: "Crunchy, restaurant-style chicken Caesar wrap in 4 minutes."
  },
  {
    id: "dorm-microwave-chicken-quesadilla",
    title: "3-Minute Dorm Chicken & Black Bean Quesadilla",
    tagline: "Fold chicken, black beans, and shredded cheese in a tortilla and microwave on a plate—zero pans.",
    prepMinutes: 1,
    cookMinutes: 2,
    category: "microwave",
    ingredients: [
      { item: "Large flour tortillas", amount: "1-2 tortillas", walmartAisle: "Bakery" },
      { item: "Pre-cooked chicken strips or tear-open chicken pouch", amount: "1/2 cup", walmartAisle: "Meat & Deli", tip: "Pantry chicken pouches need no fridge until opened" },
      { item: "Shredded Mexican blend or cheddar cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Black beans (canned, drained) or salsa", amount: "1/3 cup", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Fill Half the Tortilla",
        instruction: "Lay 1 large flour tortilla flat on a microwave-safe plate or folded paper towel. Scatter 1/2 cup pre-cooked chicken, 1/3 cup black beans, and 1/2 cup shredded cheese onto one half.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Fold & Microwave",
        instruction: "Fold the empty half of the tortilla over the filling. Microwave on HIGH for 60 to 75 seconds until the cheese is completely melted and bubbling.",
        timerSeconds: 60
      },
      {
        stepNumber: 3,
        title: "Dip & Eat",
        instruction: "Let cool 30 seconds, slice with a butter knife or fold, and dip into salsa.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "Zero stove, zero skillet, zero freezer needed—just warm melted protein in 3 minutes.",
    rutAlternativeNote: "Replaces vending machine snacks or plain chips with a hot cheesy quesadilla."
  },
  {
    id: "dorm-microwave-pasta-marinara-bowl",
    title: "5-Minute Microwave Pepperoni Mac & Marinara",
    tagline: "Cook quick elbow macaroni right in a large microwave bowl with water, then stir in marinara, pepperoni, and mozzarella.",
    prepMinutes: 1,
    cookMinutes: 4,
    category: "microwave",
    ingredients: [
      { item: "Quick-cooking elbow macaroni", amount: "1 cup dry", walmartAisle: "Pantry / Canned" },
      { item: "Jarred marinara or pasta sauce", amount: "1/2 cup", walmartAisle: "Pantry / Canned" },
      { item: "Shredded mozzarella cheese", amount: "1/2 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Sliced pepperoni or pre-cooked chicken", amount: "1/3 cup", walmartAisle: "Meat & Deli" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Microwave Pasta in Water",
        instruction: "Put 1 cup dry macaroni, 1.25 cups cold tap water, and a pinch of salt in a large deep microwave-safe bowl (leave room so water doesn't boil over). Microwave 2 minutes, stir, then microwave 2 more minutes.",
        timerSeconds: 120
      },
      {
        stepNumber: 2,
        title: "Stir in Sauce, Meat & Cheese",
        instruction: "If any water remains, pour off the extra spoonful. Stir in 1/2 cup marinara sauce, 1/3 cup sliced pepperoni or chicken, and 1/2 cup shredded mozzarella. Microwave 30 seconds until bubbly.",
        timerSeconds: 30
      }
    ],
    whyItWorks: "True hot pizza-pasta in a dorm room with just 1 bowl and 1 spoon—no pot or strainer needed.",
    rutAlternativeNote: "Upgrades plain boxed mac & cheese with marinara, pepperoni, and melted mozzarella."
  },
  {
    id: "microwave-egg-salsa-tacos",
    title: "4-Minute Microwave Egg, Cheese & Salsa Tacos",
    tagline: "Scramble fluffy eggs in a mug in 90 seconds and load into warm tortillas with cheddar and salsa.",
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
    id: "dorm-bbq-chicken-cheddar-sliders",
    title: "3-Minute BBQ Pulled Chicken & Cheddar Sub",
    tagline: "Mix pre-cooked chicken with BBQ sauce, microwave 45 seconds, and pile onto burger or sub buns with melted cheddar.",
    prepMinutes: 2,
    cookMinutes: 1,
    category: "microwave",
    ingredients: [
      { item: "Pre-cooked shredded or grilled chicken", amount: "1 cup", walmartAisle: "Meat & Deli" },
      { item: "BBQ sauce (Sweet Baby Ray's or similar)", amount: "3 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Burger buns or sub rolls", amount: "2 buns or 1 sub roll", walmartAisle: "Bakery" },
      { item: "Shredded cheddar cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Warm BBQ Chicken",
        instruction: "Put 1 cup of pre-cooked chicken and 3 tablespoons of BBQ sauce in a microwave-safe bowl, stir, cover loosely with a paper towel, and microwave 45 seconds until hot.",
        timerSeconds: 45
      },
      {
        stepNumber: 2,
        title: "Pile on Buns & Melt Cheddar",
        instruction: "Spoon the hot BBQ chicken onto 2 burger buns (or 1 split sub roll), top with 1/3 cup shredded cheddar cheese, and microwave 20 seconds to melt.",
        timerSeconds: 20
      }
    ],
    whyItWorks: "Savory, smoky BBQ sandwiches in 3 minutes with zero freezer needed and over 25g protein.",
    rutAlternativeNote: "Beats fast-food burgers or cold snacks with almost zero cleanup."
  },
  {
    id: "dorm-pb-banana-granola-wrap",
    title: "2-Minute Peanut Butter Banana Crunch Wrap",
    tagline: "Zero microwave and zero fridge needed—spread peanut butter on a tortilla, add a banana and granola, and roll.",
    prepMinutes: 2,
    cookMinutes: 0,
    category: "assembly",
    ingredients: [
      { item: "Large flour tortilla", amount: "1 tortilla", walmartAisle: "Bakery" },
      { item: "Peanut butter", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Banana", amount: "1 whole banana", walmartAisle: "Produce" },
      { item: "Granola or crunchy cereal", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Spread Peanut Butter",
        instruction: "Lay 1 flour tortilla flat on a napkin or plate and spread 2 tablespoons of peanut butter down the middle.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Add Banana, Granola & Roll",
        instruction: "Peel 1 whole banana and lay it directly on the peanut butter. Sprinkle 2 tablespoons of granola along the banana, roll up tightly like a burrito, and eat.",
        timerSeconds: 0
      }
    ],
    whyItWorks: "100% shelf-stable—works even without a mini-fridge, microwave, or clean dishes.",
    rutAlternativeNote: "Fast 2-minute fuel before morning class or a workout."
  },
  {
    id: "yogurt-berry-granola-bowl",
    title: "2-Minute Greek Yogurt Power Bowl",
    tagline: "No cooking at all—creamy Greek yogurt topped with berries and crunchy granola.",
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
    whyItWorks: "Delivers 18g+ of protein in 2 minutes with zero dishes besides a spoon and bowl.",
    rutAlternativeNote: "Fast grab-and-go breakfast or snack with real protein."
  },
  {
    id: "creamy-tuna-toast-melt",
    title: "4-Minute Cheesy Microwave Tuna Melt",
    tagline: "Mix tuna with mayo or ranch, pile onto bread or English muffins with cheddar, and melt in the microwave.",
    prepMinutes: 3,
    cookMinutes: 1,
    category: "microwave",
    ingredients: [
      { item: "Canned tuna or tear-open tuna pouch", amount: "1 can or pouch", walmartAisle: "Pantry / Canned" },
      { item: "Mayonnaise or ranch dressing", amount: "2 tablespoons", walmartAisle: "Pantry / Canned" },
      { item: "Bread or English muffins", amount: "2 slices or 1 muffin", walmartAisle: "Bakery" },
      { item: "Shredded cheddar cheese", amount: "1/3 cup", walmartAisle: "Dairy & Eggs" }
    ],
    instructions: [
      {
        stepNumber: 1,
        title: "Mix Tuna Salad",
        instruction: "Drain 1 can of tuna (or tear open a no-drain tuna pouch) and stir in a small bowl with 2 tablespoons of mayo or ranch plus a pinch of salt and pepper.",
        timerSeconds: 0
      },
      {
        stepNumber: 2,
        title: "Top Bread or Muffins",
        instruction: "Lay 2 slices of bread (or 1 split English muffin) on a microwave-safe plate. Spoon the tuna mix on top and sprinkle with 1/3 cup of shredded cheddar cheese.",
        timerSeconds: 0
      },
      {
        stepNumber: 3,
        title: "Microwave to Melt Cheese",
        instruction: "Microwave for 40 to 50 seconds until the shredded cheddar cheese is melted and warm.",
        timerSeconds: 45
      }
    ],
    whyItWorks: "Tuna pouches sit in a desk drawer for months and pack 25g+ protein in under 5 minutes.",
    rutAlternativeNote: "A hot, cheesy diner-style melt using basic pantry staples."
  },
  // Full-Kitchen (Stove / Oven / Toaster / Air Fryer) Meals
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
    category: "sheet_pan",
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
    id: "frozen-shrimp-garlic-rice-bowl",
    title: "7-Minute Garlic Shrimp & Rice Bowl",
    tagline: "Frozen cooked shrimp warms up in 3 minutes—pair with a rice pouch and frozen veggies.",
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
    id: "upgraded-peanut-ramen",
    title: "6-Minute Upgraded Peanut Ramen with Egg & Peas",
    tagline: "Boil ramen on the stove and stir in peanut butter, frozen peas, and a swirled egg for real staying power.",
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
    category: "sheet_pan",
    ingredients: [
      { item: "English muffins", amount: "2 muffins (split into 4 halves)", walmartAisle: "Bakery" },
      { item: "Jarred pasta sauce (marinara)", amount: "1/2 cup", walmartAisle: "Pantry / Canned" },
      { item: "Shredded mozzarella cheese", amount: "3/4 cup", walmartAisle: "Dairy & Eggs" },
      { item: "Sliced pepperoni or pre-cooked bacon", amount: "1/3 cup", walmartAisle: "Meat & Deli" }
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
        instruction: "Sprinkle 3/4 cup shredded mozzarella and 1/3 cup pepperoni or bacon over the halves. Bake or air-fry at 375°F for 4-5 minutes until bubbly and crisp.",
        timerSeconds: 240
      }
    ],
    whyItWorks: "Portioned in minutes with zero dough prep and crispy edges every time.",
    rutAlternativeNote: "Instant personal pizzas using bakery staples and jarred sauce."
  },
  {
    id: "waffle-egg-cheese-sandwich",
    title: "4-Minute Crispy Waffle Breakfast Sandwich",
    tagline: "Toast two frozen waffles, microwave a quick scrambled egg in a mug, and stack with cheddar.",
    prepMinutes: 1,
    cookMinutes: 3,
    category: "one_skillet",
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
