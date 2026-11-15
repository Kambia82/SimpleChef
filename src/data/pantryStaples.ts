export interface PantryCategoryGroup {
  label: string;
  items: string[];
}

export const PANTRY_STAPLE_GROUPS: PantryCategoryGroup[] = [
  {
    label: "Fridge & Deli",
    items: [
      "Eggs",
      "Shredded Cheese",
      "Rotisserie / Grilled Chicken",
      "Deli Turkey / Ham",
      "Pre-Cooked Bacon",
      "Pepperoni",
      "Ground Beef / Turkey",
      "Kielbasa / Smoked Sausage",
      "Shredded Lettuce",
      "Bagged Salad Kit",
      "Spinach",
      "Greek Yogurt",
      "Guacamole / Pico",
      "Ranch Dressing",
      "Buffalo Sauce",
      "BBQ Sauce",
      "Teriyaki Sauce"
    ]
  },
  {
    label: "Freezer",
    items: [
      "Frozen Chicken Tenders",
      "Frozen Meatballs",
      "Frozen Broccoli / Veggies",
      "Frozen Breakfast Burritos",
      "Frozen Potstickers",
      "Frozen Hashbrowns",
      "Frozen Shrimp",
      "Frozen Waffles",
      "Frozen Berries"
    ]
  },
  {
    label: "Pantry & Bakery",
    items: [
      "Flour Tortillas",
      "Sub / Burger Buns",
      "Bread / Toast",
      "Bagels / English Muffins",
      "Naan Bread",
      "Microwave Rice",
      "Mac & Cheese Cup / Elbow Mac",
      "Ramen Noodles",
      "Pasta",
      "Tortilla Chips",
      "Canned Beef Chili",
      "Canned Black Beans",
      "Pouch Chicken / Tuna",
      "Marinara / Pizza Sauce",
      "Jarred Queso / Salsa",
      "Alfredo Sauce",
      "Peanut Butter",
      "Bananas",
      "Rolled Oats",
      "Granola"
    ]
  }
];
