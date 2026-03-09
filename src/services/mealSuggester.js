/**
 * Meal Suggester Engine
 * Aggregates meals from all sources: restaurants, curated supermarkets,
 * live Open Food Facts API, and USDA FoodData Central.
 */
const restaurantMeals = require('../data/restaurants');
const curatedSupermarketMeals = require('../data/supermarkets');
const { fetchSupermarketMeals } = require('./openFoodFacts');
const { fetchUsdaMeals } = require('./usda');

/**
 * Score a meal against calorie and protein targets.
 * Lower score = better match.
 */
function scoreMeal(meal, calorieTarget, proteinTarget) {
  const calDiff = Math.abs(meal.calories - calorieTarget) / calorieTarget;
  if (proteinTarget === 0) return calDiff;
  const protDiff = Math.abs(meal.protein - proteinTarget) / (proteinTarget || 1);
  // Protein match weighted more heavily for fitness users
  return calDiff * 0.4 + protDiff * 0.6;
}

/**
 * Main entry point: get 6 balanced meal suggestions.
 * @param {object} params
 * @param {number} params.calorieTarget
 * @param {number} params.proteinTarget
 * @param {string} params.mealType - 'lunch' | 'dinner' | 'snack' | 'dessert'
 * @param {string[]} params.excludeIds - meal IDs to exclude
 * @param {string} params.country - 'France' | 'Spain' | 'Lebanon' | 'USA'
 */
async function getSuggestions({ calorieTarget, proteinTarget, mealType, country = 'France', dietary = 'none', excludeIds = [] }) {
  // 1. Gather live meals concurrently (Supermarkets)
  const [offResult, usdaResult] = await Promise.allSettled([
    fetchSupermarketMeals(mealType, country, 40),
    fetchUsdaMeals(mealType, 25),
  ]);

  const offMeals = offResult.status === 'fulfilled' ? offResult.value : [];
  const fdcMeals = usdaResult.status === 'fulfilled' ? usdaResult.value : [];

  // Filter live OFF meals to the requested meal type (prevents chicken nuggets appearing in dessert)
  const filteredOffMeals = offMeals.filter(m =>
    !m.type || m.type.includes(mealType)
  );
  // Skip USDA for desserts (no dessert data there)
  const filteredFdcMeals = mealType === 'dessert' ? [] : fdcMeals;

  // 2. Filter static data
  const targetCountry = country === 'US' ? 'USA' : country;
  const dietaryFilters = Array.isArray(dietary) ? dietary : (dietary && dietary !== 'none' ? [dietary] : []);

  // Filter restaurants (Regular Restaurants & Fast Food)
  const allRestaurantPool = restaurantMeals.filter(m => 
    m.type.includes(mealType) && 
    m.country === targetCountry &&
    (dietaryFilters.length === 0 || dietaryFilters.every(d => m.dietary && m.dietary.includes(d))) &&
    !excludeIds.includes(m.id)
  );

  // Split into Fast Food vs Restaurant
  // We classify brands with "France/USA" or known chains as Fast Food
  const fastFoodChains = ["McDonald's", "Burger King", "KFC", "Subway", "100 Montaditos", "Goiko", "Chick-fil-A", "Chipotle", "Panda Express", "7-Eleven"];
  
  const fastFoodPool = allRestaurantPool.filter(m => 
    fastFoodChains.some(chain => m.brand.includes(chain))
  ).map(m => ({ ...m, _score: scoreMeal(m, calorieTarget, proteinTarget) })).sort((a,b) => a._score - b._score);

  const restaurantPool = allRestaurantPool.filter(m => 
    !fastFoodChains.some(chain => m.brand.includes(chain))
  ).map(m => ({ ...m, _score: scoreMeal(m, calorieTarget, proteinTarget) })).sort((a,b) => a._score - b._score);

  // Filter Supermarkets (Curated + OFF)
  const staticShopPool = curatedSupermarketMeals.filter(m => 
    m.type.includes(mealType) && 
    m.country === targetCountry &&
    (dietaryFilters.length === 0 || dietaryFilters.every(d => m.dietary && m.dietary.includes(d))) &&
    !excludeIds.includes(m.id)
  );

  const supermarketPool = [...staticShopPool, ...filteredOffMeals]
    .map(m => ({ ...m, _score: scoreMeal(m, calorieTarget, proteinTarget) }))
    .sort((a, b) => a._score - b._score);

  // 3. Selection Strategy: 2 Fast-Food, 2 Restaurant, 2 Supermarket
  const picked = [];
  const usedIds = new Set();

  const pickFromPool = (pool, count) => {
    let p = 0;
    for (const m of pool) {
      if (p >= count) break;
      if (!usedIds.has(m.id)) {
        picked.push(m);
        usedIds.add(m.id);
        p++;
      }
    }
  };

  // Primary Pick (2-2-2)
  pickFromPool(fastFoodPool, 2);
  pickFromPool(restaurantPool, 2);
  pickFromPool(supermarketPool, 2);

  // 4. Fill gaps if any pool was short
  const remainingCount = 6 - picked.length;
  if (remainingCount > 0) {
    const fallbackPool = [...fastFoodPool, ...restaurantPool, ...supermarketPool, ...filteredFdcMeals]
      .filter(m => !usedIds.has(m.id))
      .sort((a, b) => (a._score || 99) - (b._score || 99));
    
    for (const m of fallbackPool) {
      if (picked.length >= 6) break;
      picked.push(m);
      usedIds.add(m.id);
    }
  }

  // 5. Final Formatting
  return picked.map(({ _score, ...m }) => ({
    ...m,
    shoppingItems: m.shoppingItems || (m.source !== 'restaurant' ? [m.name] : []),
  }));
}

module.exports = { getSuggestions };
