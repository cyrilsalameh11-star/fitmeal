// One-shot: add Pan Asie (buffet à volonté japonais) entries to france_restaurants.js
// Run: node scripts/add-panasie.js

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'france_restaurants.js');
const existing = require(DATA_PATH);

const slug = s => s.toLowerCase()
  .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i')
  .replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u').replace(/[ç]/g, 'c')
  .replace(/[^\w\s-]/g, '')
  .trim().replace(/\s+/g, '-').slice(0, 40);

// Per-portion as listed on the menu (most maki/sushi/california are "par 2 pieces")
const ITEMS = [
  // === HORS D'ŒUVRE ===
  { name: 'Soupe Miso',                            cat: 'starter',  cal: 50,  p: 3,  c: 6,  f: 2,  tag: 'soup' },
  { name: 'Salade de Choux',                       cat: 'salad',    cal: 80,  p: 2,  c: 8,  f: 4,  tag: 'salad' },
  { name: 'Riz Nature',                            cat: 'side',     cal: 200, p: 4,  c: 44, f: 1,  tag: 'rice' },
  { name: 'Riz Vinaigré',                          cat: 'side',     cal: 220, p: 4,  c: 48, f: 1,  tag: 'rice' },
  { name: 'Riz Cantonais au Poulet',               cat: 'main',     cal: 320, p: 14, c: 42, f: 10, tag: 'rice' },
  { name: 'Nouilles Sautées',                      cat: 'main',     cal: 280, p: 8,  c: 40, f: 8,  tag: 'noodles' },
  { name: 'Potatoes (6 pcs)',                      cat: 'side',     cal: 250, p: 4,  c: 32, f: 12, tag: 'fried' },
  { name: 'Bœuf Oignons sur Riz',                  cat: 'main',     cal: 380, p: 22, c: 45, f: 12, tag: 'beef' },
  { name: 'Chirashi Saumon Patate Douce',          cat: 'main',     cal: 380, p: 22, c: 50, f: 10, tag: 'salmon' },
  { name: 'Frites',                                cat: 'side',     cal: 290, p: 4,  c: 36, f: 14, tag: 'fried' },
  { name: 'Samoussa au Bœuf (2 pcs)',              cat: 'starter',  cal: 180, p: 6,  c: 18, f: 9,  tag: 'beef' },
  { name: 'Beignet Calamar (2 pcs)',               cat: 'starter',  cal: 130, p: 7,  c: 12, f: 6,  tag: 'seafood' },
  { name: 'Tartare Saumon Avocat sur Riz Vinaigré',cat: 'main',     cal: 320, p: 18, c: 32, f: 14, tag: 'salmon' },
  { name: 'Tartare Choux Saumon',                  cat: 'starter',  cal: 180, p: 14, c: 4,  f: 12, tag: 'salmon' },
  { name: 'Salade Végétarienne',                   cat: 'salad',    cal: 90,  p: 3,  c: 12, f: 3,  tag: 'vegetarian' },
  { name: 'Boulettes de Poisson (4 pcs)',          cat: 'starter',  cal: 160, p: 12, c: 14, f: 6,  tag: 'seafood' },
  { name: 'Légumes Poulet Frit (5 pcs)',           cat: 'starter',  cal: 280, p: 18, c: 18, f: 14, tag: 'chicken' },
  { name: 'Nem au Poulet (2 pcs)',                 cat: 'starter',  cal: 200, p: 6,  c: 22, f: 9,  tag: 'chicken' },
  { name: 'Tartare Thon Avocat sur Riz Vinaigré',  cat: 'main',     cal: 320, p: 22, c: 30, f: 12, tag: 'tuna' },
  { name: 'Tempuras Cheese (8 pcs)',               cat: 'starter',  cal: 320, p: 8,  c: 28, f: 18, tag: 'fried' },

  // === BROCHETTES (2 pcs) ===
  { name: 'Brochette Bœuf Fromage (2 pcs)',        cat: 'main',     cal: 220, p: 18, c: 2,  f: 14, tag: 'beef' },
  { name: 'Brochette Bœuf (2 pcs)',                cat: 'main',     cal: 180, p: 20, c: 1,  f: 10, tag: 'beef' },
  { name: 'Brochette Poulet (2 pcs)',              cat: 'main',     cal: 140, p: 22, c: 1,  f: 5,  tag: 'chicken' },
  { name: 'Brochette Aile de Poulet (2 pcs)',      cat: 'main',     cal: 160, p: 16, c: 2,  f: 9,  tag: 'chicken' },
  { name: 'Brochette Boulette de Poulet (2 pcs)',  cat: 'main',     cal: 160, p: 14, c: 4,  f: 9,  tag: 'chicken' },
  { name: 'Brochette Champignons (2 pcs)',         cat: 'main',     cal: 50,  p: 2,  c: 5,  f: 2,  tag: 'vegetarian' },

  // === MAKI (2 pcs) ===
  { name: 'Maki Thon (2 pcs)',                     cat: 'main',     cal: 60,  p: 4,  c: 10, f: 0,  tag: 'tuna' },
  { name: 'Maki Saumon (2 pcs)',                   cat: 'main',     cal: 70,  p: 4,  c: 9,  f: 2,  tag: 'salmon' },
  { name: 'Maki Concombre (2 pcs)',                cat: 'main',     cal: 50,  p: 1,  c: 11, f: 0,  tag: 'vegetarian' },
  { name: 'Maki Thon Cuit (2 pcs)',                cat: 'main',     cal: 70,  p: 5,  c: 10, f: 1,  tag: 'tuna' },
  { name: 'Maki Avocat (2 pcs)',                   cat: 'main',     cal: 70,  p: 1,  c: 10, f: 3,  tag: 'vegetarian' },
  { name: 'Maki Cheese (2 pcs)',                   cat: 'main',     cal: 80,  p: 2,  c: 10, f: 3,  tag: 'vegetarian' },

  // === CALIFORNIA MAKI (2 pcs) ===
  { name: 'California Saumon Avocat Oignon (2 pcs)', cat: 'main',   cal: 90,  p: 4,  c: 10, f: 4,  tag: 'salmon' },
  { name: 'California Saumon Avocat (2 pcs)',       cat: 'main',    cal: 90,  p: 4,  c: 10, f: 4,  tag: 'salmon' },
  { name: 'California Thon Cuit Avocat (2 pcs)',    cat: 'main',    cal: 90,  p: 5,  c: 10, f: 3,  tag: 'tuna' },
  { name: 'California Thon Cuit Avocat Oignon (2 pcs)', cat: 'main',cal: 90,  p: 5,  c: 10, f: 3,  tag: 'tuna' },
  { name: 'California Saumon Cheese (2 pcs)',       cat: 'main',    cal: 100, p: 4,  c: 10, f: 5,  tag: 'salmon' },
  { name: 'California Avocat Cheese (2 pcs)',       cat: 'main',    cal: 90,  p: 2,  c: 10, f: 4,  tag: 'vegetarian' },
  { name: 'Tobiko Roll Orange (2 pcs)',             cat: 'main',    cal: 95,  p: 4,  c: 10, f: 4,  tag: 'salmon' },
  { name: 'Tobiko Roll Wasabi (2 pcs)',             cat: 'main',    cal: 95,  p: 4,  c: 10, f: 4,  tag: 'salmon' },
  { name: 'California Avocat Concombre (2 pcs)',    cat: 'main',    cal: 80,  p: 2,  c: 12, f: 3,  tag: 'vegetarian' },
  { name: 'California Saumon Avocat Spicy Mayo (2 pcs)', cat: 'main',cal: 110,p: 4,  c: 10, f: 6,  tag: 'salmon' },
  { name: 'Maki Printemps Saumon Avocat (2 pcs)',   cat: 'main',    cal: 90,  p: 4,  c: 11, f: 4,  tag: 'salmon' },
  { name: 'Hot California Saumon Avocat (2 pcs)',   cat: 'main',    cal: 130, p: 4,  c: 12, f: 7,  tag: 'salmon' },
  { name: 'Neige Saumon (2 pcs)',                   cat: 'main',    cal: 90,  p: 4,  c: 10, f: 4,  tag: 'salmon' },
  { name: 'Neige Cheese (2 pcs)',                   cat: 'main',    cal: 90,  p: 3,  c: 10, f: 4,  tag: 'vegetarian' },
  { name: 'Neige Nutella (2 pcs)',                  cat: 'dessert', cal: 130, p: 2,  c: 18, f: 5,  tag: 'dessert' },

  // === SUSHI / NIGIRI (2 pcs) ===
  { name: 'Sushi Thon (2 pcs)',                     cat: 'main',    cal: 80,  p: 8,  c: 12, f: 0,  tag: 'tuna' },
  { name: 'Sushi Saumon (2 pcs)',                   cat: 'main',    cal: 90,  p: 7,  c: 12, f: 2,  tag: 'salmon' },
  { name: 'Sushi Saumon Oignon (2 pcs)',            cat: 'main',    cal: 90,  p: 7,  c: 12, f: 2,  tag: 'salmon' },
  { name: 'Sushi Crevettes (2 pcs)',                cat: 'main',    cal: 70,  p: 6,  c: 12, f: 0,  tag: 'shrimp' },
  { name: 'Sushi Saumon Cheese (2 pcs)',            cat: 'main',    cal: 110, p: 7,  c: 12, f: 4,  tag: 'salmon' },
  { name: 'Sushi Saumon Spicy Mayo (2 pcs)',        cat: 'main',    cal: 130, p: 7,  c: 12, f: 7,  tag: 'salmon' },

  // === SUPPLEMENT ===
  { name: 'Sashimi Saumon (5 pcs)',                 cat: 'main',    cal: 150, p: 22, c: 0,  f: 7,  tag: 'salmon' },

  // === DESSERTS ===
  { name: 'Sorbet Glace (2 boules)',                cat: 'dessert', cal: 180, p: 2,  c: 38, f: 2,  tag: 'dessert' },
  { name: 'Nougat aux Sésames',                     cat: 'dessert', cal: 170, p: 3,  c: 26, f: 6,  tag: 'dessert' },
  { name: 'Litchi au Sirop',                        cat: 'dessert', cal: 110, p: 1,  c: 28, f: 0,  tag: 'dessert' },

  // === SERVIS UNIQUEMENT LE SOIR ===
  { name: 'Tempuras Crevettes (4 pcs)',             cat: 'starter', cal: 220, p: 12, c: 18, f: 10, tag: 'shrimp' },
  { name: 'Raviolis au Poulet (4 pcs)',             cat: 'starter', cal: 200, p: 8,  c: 26, f: 6,  tag: 'chicken' },
  { name: 'Brochette Saumon (2 pcs)',               cat: 'main',    cal: 160, p: 22, c: 1,  f: 7,  tag: 'salmon' },
  { name: 'Brochette Thon (2 pcs)',                 cat: 'main',    cal: 130, p: 24, c: 1,  f: 4,  tag: 'tuna' },
  { name: 'Salade Royal Avocat Crevettes',          cat: 'salad',   cal: 220, p: 14, c: 12, f: 13, tag: 'shrimp' },
  { name: 'Sushi Saumon Braisé (2 pcs)',            cat: 'main',    cal: 110, p: 7,  c: 14, f: 3,  tag: 'salmon' },
  { name: 'Neige Saumon Cheese (2 pcs)',            cat: 'main',    cal: 100, p: 4,  c: 10, f: 5,  tag: 'salmon' },
  { name: 'Las Vegas Royal Saumon Cheese (2 pcs)',  cat: 'main',    cal: 120, p: 5,  c: 10, f: 7,  tag: 'salmon' },
  { name: 'Tempuras Crevettes Avocat (2 pcs)',      cat: 'main',    cal: 130, p: 5,  c: 10, f: 8,  tag: 'shrimp' },
  { name: 'Tempuras Crevette Mayo (2 pcs)',         cat: 'main',    cal: 140, p: 5,  c: 10, f: 9,  tag: 'shrimp' },
  { name: 'Nem aux Crevettes (2 pcs)',              cat: 'starter', cal: 200, p: 8,  c: 22, f: 9,  tag: 'shrimp' },
  { name: 'Aile de Poulet (2 pcs)',                 cat: 'starter', cal: 160, p: 16, c: 2,  f: 9,  tag: 'chicken' },
  { name: 'Maki Printemps Saumon Avocat Cheese (2 pcs)', cat: 'main',cal: 110,p: 5,  c: 10, f: 6,  tag: 'salmon' },
  { name: 'California Trio Saumon Avocat Cheese (2 pcs)', cat: 'main',cal:110,p: 5,  c: 10, f: 6,  tag: 'salmon' },
];

const typeFromCat = (cat) => {
  if (cat === 'dessert') return ['dessert', 'snack'];
  if (cat === 'starter' || cat === 'salad' || cat === 'side') return ['snack', 'lunch'];
  return ['lunch', 'dinner'];
};

const tagsFor = (it) => {
  const tags = [];
  if (it.tag) tags.push(it.tag);
  // Always include the cuisine tag
  tags.push('japanese');
  if (it.cat === 'main' && /sushi|maki|california|nigiri/i.test(it.name)) tags.push('sushi');
  return [...new Set(tags)].slice(0, 4);
};

const newEntries = ITEMS.map(it => ({
  id: `fr-panasie-${slug(it.name)}`,
  name: it.name,
  brand: 'Pan Asie',
  type: typeFromCat(it.cat),
  calories: it.cal,
  protein: it.p,
  carbs: it.c,
  fat: it.f,
  tags: tagsFor(it),
  country: 'France',
  source: 'restaurant',
  shoppingItems: [`${it.name.replace(/\s*\(\d+\s*pcs\).*$/i, '').trim()} — Pan Asie`],
}));

// Strip any prior Pan Asie entries (idempotent re-run)
const filtered = existing.filter(e => e.brand !== 'Pan Asie');
const merged = [...filtered, ...newEntries];

const out = 'module.exports = ' + JSON.stringify(merged, null, 2) + ';\n';
fs.writeFileSync(DATA_PATH, out);

console.log(`Wrote ${merged.length} total France entries.`);
console.log(`  Pan Asie new: ${newEntries.length}`);
