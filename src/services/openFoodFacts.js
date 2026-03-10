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
 * @param {string} country   - 'France' | 'USA' | 'Spain' | 'Lebanon'
 * @param {number} maxItems  - max items to return (default 30)
 */
async function fetchSupermarketMeals(mealType, country = 'France', maxItems = 30) {
  const keywords = (QUERY_KEYWORDS[mealType] || QUERY_KEYWORDS.lunch).slice(0, 2);
  const results = [];
  const seenIds = new Set();

  // Mapping internal country names to OFF parameters
  const countryConfig = {
    'France': { cc: 'fr', lc: 'fr', brands: ['carrefour', 'monoprix', 'casino', 'leclerc', 'lidl', 'aldi'] },
    'USA': { cc: 'us', lc: 'en', brands: ['walmart', 'target', 'kroger', 'whole foods', 'trader joe'] },
    'Spain': { cc: 'es', lc: 'es', brands: ['mercadona', 'carrefour', 'lidl', 'dia', 'alcampo'] },
    'Lebanon': { cc: 'lb', lc: 'en', brands: ['spinneys', 'carrefour'] }
  };

  const config = countryConfig[country] || countryConfig['France'];

  for (const keyword of keywords) {
    try {
      const response = await axios.get(OFF_BASE, {
        params: {
          search_terms: keyword,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 15,
          fields: 'code,product_name,product_name_fr,brands,quantity,nutriments,categories_tags',
          lc: config.lc,
          cc: config.cc,
        },
        timeout: 2000,
      });

      const products = response.data?.products || [];
      for (const p of products) {
        // Normalise manually to apply brand filter for the specific country
        const n = p.nutriments || {};
        const calories = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0);
        const protein = Math.round(n.proteins_100g || n.proteins || 0);
        if (!calories || !protein) continue;

        const brandStr = (p.brands || '').toLowerCase();
        const brandMatch = config.brands.some(b => brandStr.includes(b));
        if (!brandMatch) continue;

        const name = p.product_name_fr || p.product_name || 'Unknown Product';
        const id = `off-${p.code || Math.random().toString(36).slice(2)}`;

        if (!seenIds.has(id)) {
          seenIds.add(id);
          results.push({
            id,
            name: `${name}${p.quantity ? ` (${p.quantity})` : ''}`,
            brand: p.brands.split(',')[0].trim(),
            calories,
            protein,
            carbs: Math.round(n.carbohydrates_100g || n.carbohydrates || 0),
            fat: Math.round(n.fat_100g || n.fat || 0),
            source: 'supermarket',
            type: [mealType],
            country: country,
            shoppingItems: [name],
            tags: []
          });
          if (results.length >= maxItems) break;
        }
      }
    } catch (err) {
      console.warn(`[OFF] Warning fetching "${keyword}" for ${country}:`, err.message);
    }
    if (results.length >= maxItems) break;
  }

  return results;
}

module.exports = { fetchSupermarketMeals };
