/**
 * Fetches real product data from Open Food Facts API
 * for French supermarkets (Carrefour, Monoprix, Picard, Auchan)
 * and writes to src/data/supermarkets_real.js
 */

const https = require('https');
const fs = require('fs');

const BRANDS = {
  France: ['Carrefour', 'Monoprix', 'Picard', 'Auchan'],
  Lebanon: ['Spinneys', 'Charcutier', 'Carrefour Lebanon']
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'RuFlo-MealPlanner/1.0 (meal-planning app; contact@ruflo.app)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function classifyMealType(product) {
  const name = (product.product_name || '').toLowerCase();
  const cats = (product.categories || '').toLowerCase();
  const types = [];
  if (/cereal|muesli|granola|yaourt|yogurt|fromage blanc|lait|milk|smoothie|jus|juice|avoine|oat|egg|oeuf|croissant|pain|bread|toast/.test(name + cats)) types.push('breakfast');
  if (/salade|sandwich|wrap|bowl|lunch|déjeuner|soupe|soup|quiche|tarte|pizza|pasta|pâtes/.test(name + cats)) types.push('lunch');
  if (/plat|dinner|dîner|lasagne|gratin|poulet|boeuf|porc|poisson|fish|viande|meat|saumon|salmon|risotto|tajine/.test(name + cats)) types.push('dinner');
  if (/biscuit|chips|snack|barre|bar|chocolat|gâteau|cake|dessert|glace|ice|bonbon|candy|fruit|noix|nut/.test(name + cats)) types.push('snack');
  return types.length > 0 ? types : ['lunch'];
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[ùûü]/g, 'u')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 30);
}

async function fetchBrandProducts(brand, country, targetCount = 60) {
  const brandQuery = encodeURIComponent(brand.toLowerCase().replace(/ /g, '+'));
  const countryCode = country === 'France' ? 'france' : 'world';

  // Search by brand on Open Food Facts
  const url = `https://world.openfoodfacts.org/cgi/search.pl?tagtype_0=brands&tag_contains_0=contains&tag_0=${brandQuery}&tagtype_1=countries&tag_contains_1=contains&tag_1=${countryCode}&nutriment_0=proteins_100g&nutriment_compare_0=gt&nutriment_value_0=0&nutriment_1=energy-kcal_100g&nutriment_compare_1=gt&nutriment_value_1=0&action=process&json=1&page_size=${targetCount}&fields=product_name,brands,nutriments,categories,quantity,image_url&sort_by=unique_scans_n`;

  console.log(`Fetching ${brand} (${country})...`);

  try {
    const data = await fetchJSON(url);
    const products = (data.products || []).filter(p => {
      const n = p.nutriments || {};
      const name = (p.product_name || '').trim();
      return name.length > 2
        && n['energy-kcal_100g'] > 0
        && n['proteins_100g'] >= 0
        && n['carbohydrates_100g'] >= 0
        && n['fat_100g'] >= 0;
    });

    const seen = new Set();
    const results = [];
    const prefix = `${country === 'France' ? 'fr' : 'lb'}-${brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 6)}`;

    for (const p of products) {
      if (results.length >= targetCount) break;
      const name = p.product_name.trim();
      if (seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());

      const n = p.nutriments;
      // Convert per 100g to per serving (assume ~150g serving if no serving size)
      const servingG = parseFloat(p.serving_quantity) || 150;
      const factor = servingG / 100;

      const calories = Math.round((n['energy-kcal_100g'] || 0) * factor);
      const protein = Math.round((n['proteins_100g'] || 0) * factor * 10) / 10;
      const carbs = Math.round((n['carbohydrates_100g'] || 0) * factor * 10) / 10;
      const fat = Math.round((n['fat_100g'] || 0) * factor * 10) / 10;

      if (calories < 20 || calories > 1200) continue;

      const slug = slugify(name);
      const id = `${prefix}-${slug}-${results.length}`;

      results.push({
        id,
        name,
        brand,
        type: classifyMealType(p),
        calories,
        protein,
        carbs,
        fat,
        source: 'supermarket',
        country,
        shoppingItems: [`${name} — ${brand}`]
      });
    }

    console.log(`  → ${results.length} products found for ${brand}`);
    return results;
  } catch (err) {
    console.error(`  Error fetching ${brand}: ${err.message}`);
    return [];
  }
}

async function main() {
  const allResults = {};

  for (const [country, brands] of Object.entries(BRANDS)) {
    allResults[country] = {};
    for (const brand of brands) {
      const products = await fetchBrandProducts(brand, country, 70);
      allResults[country][brand] = products;
      await sleep(1500); // polite rate limiting
    }
  }

  // Print summary
  console.log('\n=== SUMMARY ===');
  for (const [country, brands] of Object.entries(allResults)) {
    for (const [brand, items] of Object.entries(brands)) {
      console.log(`${brand} (${country}): ${items.length} items`);
    }
  }

  // Save to JSON for inspection
  fs.writeFileSync(
    'scripts/supermarket_real_data.json',
    JSON.stringify(allResults, null, 2)
  );
  console.log('\nSaved to scripts/supermarket_real_data.json');
}

main().catch(console.error);
