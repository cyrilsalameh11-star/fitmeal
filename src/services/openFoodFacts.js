/**
 * Open Food Facts API service.
 * Queries French supermarket products (Carrefour, Monoprix) with real nutritional data.
 */
const axios = require('axios');

const OFF_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

// Meal-type keyword groups for querying Open Food Facts
const QUERY_KEYWORDS = {
  lunch: ['poulet', 'salade composée', 'sandwich thon', 'quiche', 'plat cuisiné poulet'],
  dinner: ['pâtes bolognaise', 'steak haché', 'filet de saumon', 'taboulé', 'lasagnes'],
  snack: ['yaourt protéiné', 'fromage blanc', 'barre protéine', 'amandes', 'jambon'],
};

/**
 * Normalise a raw Open Food Facts product into our common meal shape.
 */
function normaliseProduct(product) {
  const n = product.nutriments || {};
  const calories = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0);
  const protein = Math.round(n.proteins_100g || n.proteins || 0);
  const carbs = Math.round(n.carbohydrates_100g || n.carbohydrates || 0);
  const fat = Math.round(n.fat_100g || n.fat || 0);

  if (!calories || !protein) return null; // skip incomplete data

  const brand = (product.brands || '').split(',')[0].trim();
  if (!brand) return null;

  // Only accept known French supermarket brands
  const knownBrands = ['carrefour', 'monoprix', 'casino', 'leclerc', 'lidl', 'aldi'];
  const lowerBrand = brand.toLowerCase();
  const isKnown = knownBrands.some((b) => lowerBrand.includes(b));
  if (!isKnown) return null;

  const name = product.product_name_fr || product.product_name || 'Produit inconnu';

  // Shopping list — ingredients or product name
  const shoppingItems = name ? [name] : [];

  return {
    id: `off-${product.code || Math.random().toString(36).slice(2)}`,
    name: `${name}${product.quantity ? ` (${product.quantity})` : ''}`,
    brand,
    calories,
    protein,
    carbs,
    fat,
    source: 'supermarket',
    store: lowerBrand.includes('monoprix') ? 'Monoprix' : 'Carrefour',
    shoppingItems,
    tags: [],
  };
}

/**
 * Fetch supermarket meal options from Open Food Facts for a given meal type.
 * Tries multiple keyword queries and deduplicates.
 * @param {string} mealType  - 'lunch' | 'dinner' | 'snack'
 * @param {number} maxItems  - max items to return (default 30)
 */
async function fetchSupermarketMeals(mealType, maxItems = 30) {
  const keywords = QUERY_KEYWORDS[mealType] || QUERY_KEYWORDS.lunch;
  const results = [];
  const seenIds = new Set();

  for (const keyword of keywords) {
    try {
      const response = await axios.get(OFF_BASE, {
        params: {
          search_terms: keyword,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 12,
          fields:
            'code,product_name,product_name_fr,brands,quantity,nutriments,categories_tags',
          // Prefer French products
          lc: 'fr',
          cc: 'fr',
        },
        timeout: 8000,
      });

      const products = response.data?.products || [];
      for (const p of products) {
        const meal = normaliseProduct(p);
        if (meal && !seenIds.has(meal.id)) {
          seenIds.add(meal.id);
          results.push({ ...meal, type: [mealType] });
          if (results.length >= maxItems) break;
        }
      }
    } catch (err) {
      // Non-fatal: log and continue with next keyword
      console.warn(`[OFF] Warning fetching "${keyword}":`, err.message);
    }

    if (results.length >= maxItems) break;
  }

  return results;
}

module.exports = { fetchSupermarketMeals };
