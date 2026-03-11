const fs = require('fs');
const path = require('path');

const REAL_NAMES = {
  'Abdallah': [
    "Assorted Milk Chocolates", "Dark Chocolate Truffles", "Malban with Pistachio", "Nougat with Almonds", 
    "Chocolate Covered Dates", "Marzipan Fruits", "Hazelnut Pralines", "Chocolate Caramels", 
    "White Chocolate Raspberries", "Pistachio Croquant", "Almond Dragees", "Chocolate Wafer Rolls",
    "Coffee Beans in Chocolate", "Fruit Jellies (Pâtes de Fruits)", "Ghazal El Banat with Pistachio"
  ],
  'Amorino': [
    "Pistachio Gelato", "Amarena Cherry Gelato", "Dark Chocolate Sorbet", "Mango Alfonso Sorbet",
    "Stracciatella Gelato", "Hazelnut Chocolate Gelato", "Vanilla Bourbon Gelato", "Amorino Signature Crepe",
    "Waffle with Nutella", "Gelato Macaron (Vanilla)", "Gelato Macaron (Chocolate)", "Lemon Basil Sorbet",
    "Strawberry Camarosa Sorbet", "Caramel with Salted Butter Gelato", "Coffee Gelato"
  ],
  'Al Farooj': [
    "Charcoal Grilled Chicken (Half)", "Broasted Chicken (4 pcs)", "Chicken Shawarma Wrap", 
    "Spicy Chicken Fillet Sandwich", "Garlic Dip (Toum)", "Fattoush Salad", "Hummus with Meat",
    "Chicken Tikka Skewers", "Shish Tawook Sandwich", "Mixed Grill Platter", "Fries with Garlic Sauce",
    "Crispy Chicken Salad", "Cheese Rakakat", "Zinger Wrap", "Lentil Soup"
  ],
  "McDonald's UAE": [
    "McArabia Chicken", "Spicy McChicken", "Chicken Mac", "Double Cheeseburger", "Big Tasty",
    "Filet-O-Fish", "Chicken McNuggets (9 pcs)", "Grand Chicken Spicy", "Fries (Large)", "Apple Pie",
    "McFlurry Oreo", "Spicy Chicken Burger", "McWrap Chicken Sweet Chilli", "Halloumi Muffin", "Hash Browns"
  ],
  'KFC UAE': [
    "Zinger Burger", "Twister Wrap Spicy", "Dinner Meal (3 pcs)", "Mighty Zinger", "Super Meal",
    "Spicy Rizo", "Crispy Strips (5 pcs)", "Coleslaw (Large)", "Popcorn Chicken", "Zinger Shrimp Meal",
    "Krushers Cookies & Cream", "Cob玉米", "Garlic Mayo Dip", "Spicy Chicken Wing (4 pcs)", "Fries (Large)"
  ],
  'Al Baik': [
    "Chicken Meal (4 pcs)", "Spicy Chicken Meal (4 pcs)", "Jumbo Shrimp Meal (10 pcs)", 
    "Big Baik Sandwich", "Spicy Big Baik", "Chicken Fillet Burger", "Fish Fillet Meal",
    "Corn on the Cob", "Garlic Sauce", "Cocktail Sauce", "Baik Fries", "Spicy Chicken Nuggets (10 pcs)",
    "Chicken Nuggets (7 pcs)", "Fish Sandwich", "Hummus"
  ],
  'Calo': [
    "Grilled Salmon with Quinoa", "Beef Teriyaki Bowl", "Keto Chicken Parmesan", "Turkey Meatballs & Zoodles",
    "Sweet Potato Mash & Chicken", "Vegan Lentil Shepherd's Pie", "Chicken Pesto Pasta", "Spicy Thai Beef Salad",
    "Mediterranean Chicken Bowl", "Cauliflower Rice & Beef", "Overnight Oats with Berries", "Protein Pancakes",
    "Grilled Eggplant & Halloumi", "Miso Glazed Cod", "Healthy Chicken Tikka Masala"
  ],
  'Kudu': [
    "Kudu Chicken Sandwich", "Kudu Beef Sandwich", "Philly Steak Sandwich", "Breakfast Platter",
    "Club Sandwich", "Lattice Fries", "Chicken Strips Meal", "Spicy Kudu Chicken", "Kudu Nuggets (10 pcs)",
    "Halloumi Sandwich", "Zesty Chicken Salad", "Kudu Wrap", "Hash Browns", "Chocolate Cookie", "Croissant"
  ],
  'Supermarket_UAE': [
    "Fresh Chicken Caesar Salad", "Quinoa & Feta Bowl", "Roast Beef Baguette", "Chicken Tikka Wrap",
    "Greek Salad with Olives", "Smoked Salmon Cream Cheese Sandwich", "Fresh Sushi Box (12 pcs)",
    "Hummus & Veggie Sticks", "Fruit Salad Bowl", "Overnight Chia Pudding", "Protein Bar (Chocolate)",
    "Cold Pressed Green Juice", "Grilled Chicken Breast (Ready to Eat)", "Mixed Nuts (Unsalted)", 
    "Edamame Beans", "Labneh & Zaatar Croissant", "Falafel Wrap", "Tandoori Chicken Salad",
    "Poke Bowl (Salmon)", "Lentil Soup (Ready to Heat)", "Biryani (Ready Meal)", "Butter Chicken with Rice",
    "Pasta Bolognese (Ready Meal)", "Tuna Salad Sandwich", "Keto Cauliflower Rice Bowl", 
    "Vegan Buddha Bowl", "Spinach Fatayer", "Cheese Manakish", "Fresh Mango Slices", "Almond Milk (Unsweetened)"
  ],
  'Supermarket_KSA': [
    "Chicken Shawarma Wrap", "Beef Mutabal Meal", "Hummus with Pita", "Fresh Dates (Ajwa)",
    "Cheese Sambousek", "Meat Fatayer", "Chicken Kabsa (Ready Meal)", "Mandi Rice (Ready Meal)",
    "Foul Medames (Ready to Heat)", "Labneh Sandwich", "Fresh Mixed Grill", "Arabic Salad",
    "Tabbouleh", "Grape Leaves (Yalanji)", "Dates & Nuts Energy Balls", "Protein Yogurt (Plain)",
    "Grilled Halloumi Cheese", "Chicken Musakhan Roll", "Mutabal Box", "Baba Ghanoush",
    "Lentil Soup", "Spicy Tuna Sandwich", "Turkey & Cheese Croissant", "Fresh Orange Juice",
    "Pomegranate Seeds Box", "Camel Milk", "Dates Maamoul", "Basbousa Slice", "Mixed Baklava", "Keto Nut Mix"
  ]
};

const getReplacementName = (brand, type, index) => {
  let list = [];
  if (['Spinneys Dubai', 'Carrefour UAE', 'Choithrams'].includes(brand)) {
    list = REAL_NAMES['Supermarket_UAE'];
  } else if (['Panda', 'Tamimi Markets', 'Al Raya'].includes(brand)) {
    list = REAL_NAMES['Supermarket_KSA'];
  } else {
    list = REAL_NAMES[brand];
  }

  if (list && list.length > 0) {
    return list[index % list.length];
  }
  return `${brand} Selection ${index + 1}`;
};

const processFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Quick regex to parse out items since it's a JS file with module.exports
  // Instead of full AST, let's just use eval on the array string if possible, 
  // or simple regex replacements for "name": "xyz item X"
  
  let newContent = content.replace(/["']?name["']?:\s*["']([^"']+)["']/g, (match, currentName) => {
    // Check if it's one of our generated names like "Panda item 1"
    const regex = /^(.+?)\s+(?:item|Specialty Item)\s+(\d+)$/i;
    const matchGenerated = currentName.match(regex);
    if (matchGenerated) {
      const brand = matchGenerated[1];
      const index = parseInt(matchGenerated[2], 10) - 1;
      const newName = getReplacementName(brand, 'unknown', index);
      return `"name": "${newName}"`;
    }
    return match;
  });

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Processed ${filePath}`);
};

const files = [
  'lebanon_restaurants.js',
  'france_restaurants.js',
  'uae_restaurants.js',
  'ksa_restaurants.js',
  'supermarkets.js'
];

files.forEach(f => {
  processFile(path.join(__dirname, 'src', 'data', f));
});
