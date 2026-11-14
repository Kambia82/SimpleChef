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
      "Rotisserie Chicken",
      "Deli Turkey / Ham",
      "Ground Beef / Turkey",
      "Kielbasa / Sausage",
      "Pre-Cooked Bacon",
      "Spinach",
      "Bagged Salad Kit",
      "Coleslaw Mix",
      "Greek Yogurt",
      "Cottage Cheese",
      "Hummus",
      "Baby Carrots"
    ]
  },
  {
    label: "Freezer",
    items: [
      "Frozen Veggies",
      "Frozen Broccoli",
      "Frozen Meatballs",
      "Frozen Chicken Tenders",
      "Frozen Potstickers",
      "Frozen Shrimp",
      "Frozen Salmon Fillets",
      "Frozen Hashbrowns",
      "Frozen Berries",
      "Frozen Waffles"
    ]
  },
  {
    label: "Pantry & Bakery",
    items: [
      "Tortillas",
      "Bread / Toast",
      "English Muffins",
      "Naan Bread",
      "Pita Bread",
      "Microwave Rice",
      "Pasta",
      "Ramen Noodles",
      "Canned Black Beans",
      "Canned Chickpeas",
      "Canned Tuna",
      "Canned Chili",
      "Canned Tomato Soup",
      "Pasta Sauce",
      "Alfredo Sauce",
      "Pesto",
      "Salsa",
      "Peanut Butter",
      "Rolled Oats",
      "Sweet Potato",
      "Granola"
    ]
  }
];
