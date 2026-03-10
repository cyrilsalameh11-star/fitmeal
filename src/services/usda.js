/**
 * USDA FoodData Central API service.
 * Uses the free, no-key-required demo endpoint for common food items.
 */
const axios = require('axios');

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

// Free demo API key from USDA (public, rate-limited)
const API_KEY = 'DEMO_KEY';

// Generic food searches by meal type
const QUERY_KEYWORDS = {
  lunch: ['grilled chicken breast', 'tuna salad', 'turkey sandwich', 'chicken caesar salad'],
  dinner: ['salmon fillet', 'beef steak', 'pasta bolognese', 'chicken stir fry'],
  snack: ['greek yogurt', 'protein bar', 'boiled egg', 'cottage cheese', 'almonds'],
};

// Typical serving sizes in grams per meal type
const SERVING_SIZE = {
  lunch: 300,
  dinner: 350,
  snack: 150,
};

/**
 * Compute macros for a given serving size from per-100g values.
 */
function scaleMacros(nutriments, servingG) {
  const factor = servingG / 100;
  const get = (name) => {
    const item = nutriments.find((n) => n.nutrientName?.toLowerCase().includes(name));
    return item ? Math.round((item.value || 0) * factor) : 0;
  };
  return {
    calories: get('energy'),
    protein: get('protein'),
    carbs: get('carbohydrate'),
    fat: get('total lipid'),
  };
}

/**
 * Normalise a USDA food item into our common meal shape.
 */
function normaliseItem(item, mealType) {
  const serving = SERVING_SIZE[mealType] || 250;
  const nutriments = item.foodNutrients || [];
  const macros = scaleMacros(nutriments, serving);

  if (!macros.calories || !macros.protein) return null;

  const description = item.description || 'Food item';

  return {
    id: `usda-${item.fdcId}`,
    name: description,
    brand: item.brandOwner || item.dataType || 'USDA',
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    source: 'usda',
    type: [mealType],
    shoppingItems: [description],
    tags: [],
  };
}

/**
 * Fetch food items from USDA FoodData Central for a given meal type.
 * @param {string} mealType - 'lunch' | 'dinner' | 'snack'
 * @param {number} maxItems
 */
async function fetchUsdaMeals(mealType, maxItems = 20) {
  const keywords = (QUERY_KEYWORDS[mealType] || QUERY_KEYWORDS.lunch).slice(0, 2);
  const results = [];
  const seenIds = new Set();

  for (const keyword of keywords) {
    try {
      const response = await axios.get(`${USDA_BASE}/foods/search`, {
        params: {
          query: keyword,
          api_key: API_KEY,
          pageSize: 6,
          dataType: 'SR Legacy,Survey (FNDDS)',
        },
        timeout: 2000,
      });

      const foods = response.data?.foods || [];
      for (const food of foods) {
        const meal = normaliseItem(food, mealType);
        if (meal && !seenIds.has(meal.id)) {
          seenIds.add(meal.id);
          results.push(meal);
          if (results.length >= maxItems) break;
        }
      }
    } catch (err) {
      console.warn(`[USDA] Warning fetching "${keyword}":`, err.message);
    }
    if (results.length >= maxItems) break;
  }

  return results;
}

module.exports = { fetchUsdaMeals };
