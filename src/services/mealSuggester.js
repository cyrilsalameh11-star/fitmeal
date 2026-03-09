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
 * Filter meals to those within tolerance of calorie and protein targets.
 */
function filterByTargets(meals, calorieTarget, proteinTarget) {
  const CAL_TOLERANCE = 0.30; // ±30%
  const PROT_TOLERANCE = 0.40; // ±40%

  return meals.filter((m) => {
    const calOk =
      m.calories >= calorieTarget * (1 - CAL_TOLERANCE) &&
      m.calories <= calorieTarget * (1 + CAL_TOLERANCE);
      
    if (proteinTarget === 0) return calOk;

    const protOk =
      m.protein >= proteinTarget * (1 - PROT_TOLERANCE) &&
      m.protein <= proteinTarget * (1 + PROT_TOLERANCE);
    return calOk || protOk; // at least one dimension matches
  });
}

/**
 * Pick N diverse suggestions:
 * - Try to include at least one from each source category
 * - Sort remaining by score
 */
function pickDiverse(scored, count, excludeIds = []) {
  // Exclude already-shown meals
  const available = scored.filter((m) => !excludeIds.includes(m.id));

  const restaurant = available.filter((m) => m.source === 'restaurant');
  const supermarket = available.filter((m) => m.source === 'supermarket');
  const usda = available.filter((m) => m.source === 'usda');

  const picked = [];
  const usedIds = new Set();

  const addBest = (pool) => {
    const item = pool.find((m) => !usedIds.has(m.id));
    if (item) {
      picked.push(item);
      usedIds.add(item.id);
    }
  };

  // One from each source first
  addBest(restaurant);
  addBest(supermarket);
  addBest(usda);

  // Fill remaining slots from the full sorted pool
  for (const m of available) {
    if (picked.length >= count) break;
    if (!usedIds.has(m.id)) {
      picked.push(m);
      usedIds.add(m.id);
    }
  }

  return picked.slice(0, count);
}

/**
 * Main entry point: get N meal suggestions.
 * @param {object} params
 * @param {number} params.calorieTarget
 * @param {number} params.proteinTarget
 * @param {string} params.mealType - 'lunch' | 'dinner' | 'snack'
 * @param {string[]} params.excludeIds - meal IDs to exclude (for swap)
 * @param {number} params.count - number of suggestions (default 3)
 */
async function getSuggestions({ calorieTarget, proteinTarget, mealType, country = 'France', dietary = 'none', excludeIds = [], count = 3 }) {
  // 1. Gather live meals concurrently
  const [offResult, usdaResult] = await Promise.allSettled([
    fetchSupermarketMeals(mealType, country, 40),
    fetchUsdaMeals(mealType, 25),
  ]);

  const offMeals = offResult.status === 'fulfilled' ? offResult.value : [];
  const fdcMeals = usdaResult.status === 'fulfilled' ? usdaResult.value : [];

  // 2. Filter static data by meal type (restaurants + curated supermarkets)
  const restMeals = restaurantMeals.filter(
    (m) => m.type.includes(mealType) && !excludeIds.includes(m.id)
  );
  const staticShopMeals = curatedSupermarketMeals.filter(
    (m) => m.type.includes(mealType) && !excludeIds.includes(m.id)
  );

  // 3. Combine all sources (static first for reliability, then live API)
  const allMeals = [...restMeals, ...staticShopMeals, ...offMeals, ...fdcMeals];

  // Apply country filter
  const countryFiltered = allMeals.filter(m => {
    let c = m.country || (m.source === 'usda' ? 'USA' : 'France');
    if (c === 'US') c = 'USA';
    const target = country === 'US' ? 'USA' : country;
    return c === target;
  });

  // Apply dietary filter
  const dietFiltered = dietary !== 'none' 
    ? countryFiltered.filter(m => m.dietary && m.dietary.includes(dietary)) 
    : countryFiltered;

  // 4. Filter + score
  let candidates = filterByTargets(dietFiltered, calorieTarget, proteinTarget);

  // If strict filter yields too few, relax it
  if (candidates.length < count * 2) {
    candidates = dietFiltered;
  }

  const scored = candidates
    .map((m) => ({ ...m, _score: scoreMeal(m, calorieTarget, proteinTarget) }))
    .sort((a, b) => a._score - b._score);

  // 5. Pick diverse set
  const suggestions = pickDiverse(scored, count, excludeIds);

  // 6. Clean up internal score field & ensure shoppingItems
  return suggestions.map(({ _score, ...m }) => ({
    ...m,
    shoppingItems: m.shoppingItems || (m.source !== 'restaurant' ? [m.name] : []),
  }));
}

module.exports = { getSuggestions };
