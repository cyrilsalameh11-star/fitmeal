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
async function getSuggestions({ calorieTarget, proteinTarget, mealType, country = 'France', dietary = 'none', brand = '', excludeIds = [] }) {
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

  // ── Tag-based dietary filter ───────────────────────────────────────────────
  // Restaurant items use `tags[]` not `dietary[]`, so we map constraints to excluded tags.
  const MEAT_TAGS       = ['beef', 'pork', 'chicken', 'fish', 'turkey', 'bacon', 'ham', 'hotdog', 'pork'];
  const GLUTEN_TAGS     = ['burger', 'sandwich', 'sub', 'wrap', 'pizza', 'pasta', 'bakery', 'crepe', 'quiche'];
  const LACTOSE_TAGS    = ['cheese', 'pizza'];  // items explicitly tagged cheese/pizza
  const PORK_TAGS       = ['pork', 'bacon', 'ham'];
  const HIGH_CARB_TYPES = ['burger', 'sandwich', 'sub', 'wrap', 'pizza', 'pasta', 'bakery', 'crepe', 'sweet'];

  function matchesDietaryFilters(meal, filters) {
    if (!filters || filters.length === 0) return true;
    const tags = meal.tags || [];

    for (const f of filters) {
      if (f === 'vegetarian' || f === 'vegan') {
        // Must not have any meat tags
        if (tags.some(t => MEAT_TAGS.includes(t))) return false;
        if (f === 'vegan') {
          // Also exclude egg and cheese
          if (tags.some(t => ['egg', 'cheese', 'vegetarian'].includes(t) && t === 'cheese')) return false;
          // Vegan items: must be tagged vegan or have no animal products
          const isVegan = tags.includes('vegan') || (!tags.some(t => [...MEAT_TAGS, 'egg', 'cheese'].includes(t)));
          if (!isVegan) return false;
        }
      }
      if (f === 'gluten_free') {
        // Exclude items that typically contain gluten
        if (tags.some(t => GLUTEN_TAGS.includes(t))) return false;
      }
      if (f === 'lactose_free') {
        // Exclude items that contain cheese or dairy-heavy items
        if (tags.some(t => LACTOSE_TAGS.includes(t))) return false;
        if (meal.name && /cheese|cream|butter|yogurt|lait|fromage/i.test(meal.name)) return false;
      }
      if (f === 'halal') {
        // Exclude pork and bacon
        if (tags.some(t => PORK_TAGS.includes(t))) return false;
      }
      if (f === 'keto') {
        // Item must be tagged keto, OR have low carb ratio
        const isTaggedKeto = tags.includes('keto');
        const isLowCarb = meal.carbs != null && meal.calories != null
          ? (meal.carbs * 4) / (meal.calories || 1) < 0.25
          : false;
        if (!isTaggedKeto && !isLowCarb) return false;
      }
    }
    return true;
  }

  // Filter restaurants
  const allRestaurantPool = restaurantMeals.filter(m =>
    m.type.includes(mealType) &&
    m.country === targetCountry &&
    matchesDietaryFilters(m, dietaryFilters) &&
    (!brand || m.brand === brand) &&
    !excludeIds.includes(m.id)
  );


  // Split into Fast Food vs Restaurant
  // We classify brands with "France/USA" or known chains as Fast Food
  const fastFoodChains = ["McDonald's", "Burger King", "KFC", "Subway", "100 Montaditos", "Goiko", "Chick-fil-A", "Chipotle", "Panda Express", "7-Eleven", "Quick", "O'Tacos", "Chicken Street", "Peppe Chicken", "Five Guys", "Telepizza", "Cava", "Dip n Dip", "Pinkberry"];
  
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
    matchesDietaryFilters(m, dietaryFilters) &&
    (!brand || m.brand === brand) &&
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
