// One-shot script: replace Roadster / Crepaway / Dip n Dip entries in
// lebanon_restaurants.js with menu-extracted items, leave other brands intact.
//
// Run: node scripts/update-explore-from-menus.js

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'lebanon_restaurants.js');
const existing = require(DATA_PATH);

// Slug helper for stable ids
const slug = s => s.toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 40);

const tagFromCategory = (cat, name, desc) => {
  const tags = [];
  const c = (cat + ' ' + name + ' ' + (desc || '')).toLowerCase();
  if (c.includes('chicken')) tags.push('chicken');
  if (c.includes('beef') || c.includes('angus') || c.includes('burger')) tags.push('beef');
  if (c.includes('shrimp') || c.includes('salmon') || c.includes('crab')) tags.push('seafood');
  if (cat === 'salad' || c.includes('salad')) tags.push('salad');
  if (cat === 'burger' || c.includes('burger')) tags.push('burger');
  if (cat === 'sandwich' || c.includes('sandwich') || c.includes('wrap')) tags.push('sandwich');
  if (cat === 'pasta' || c.includes('pasta')) tags.push('pasta');
  if (cat === 'pizza' || c.includes('pizza') || c.includes('manakish')) tags.push('lebanese');
  if (cat === 'dessert' || cat === 'crepe' || cat === 'pancake' || cat === 'waffle' || cat === 'ice cream') tags.push('dessert');
  if (cat === 'drink') tags.push('drink');
  if (cat === 'breakfast') tags.push('breakfast');
  if (c.includes('vegetarian') || c.includes('mushroom patty')) tags.push('vegetarian');
  return [...new Set(tags)].slice(0, 4);
};

const typeFromCategory = (cat) => {
  if (cat === 'breakfast') return ['breakfast'];
  if (cat === 'drink') return ['drink', 'snack'];
  if (cat === 'dessert' || cat === 'crepe' || cat === 'pancake' || cat === 'waffle' || cat === 'ice cream') return ['dessert', 'snack'];
  if (cat === 'soup' || cat === 'starter' || cat === 'appetizer') return ['snack', 'lunch'];
  if (cat === 'side') return ['snack'];
  return ['lunch', 'dinner'];
};

function buildEntries(brand, prefix, items) {
  return items.map((it, i) => ({
    id: `${prefix}-${slug(it.name)}-${i + 1}`,
    name: it.name,
    brand,
    type: typeFromCategory(it.category),
    calories: Math.round(it.calories),
    protein: Math.round(it.protein),
    carbs: Math.round(it.carbs),
    fat: Math.round(it.fat),
    tags: tagFromCategory(it.category, it.name, it.desc),
    country: 'Lebanon',
  }));
}

const ROADSTER = require('./_menu_data/roadster.json');
const CREPAWAY = require('./_menu_data/crepaway.json');
const DIPNDIP  = require('./_menu_data/dipndip.json');
const ZWZ      = require('./_menu_data/zwz.json');
const MCDO     = require('./_menu_data/mcdonalds.json');
const SWISSB   = require('./_menu_data/swissbutter.json');
const ABDALLAH = require('./_menu_data/abdallah.json');
const MALAK    = require('./_menu_data/malak.json');

// Strip existing entries for these brands
const brandsToReplace = new Set([
  'Roadster Diner', 'Crepaway', 'Dip n Dip', 'Zaatar w Zeit',
  "McDonald's Lebanon", 'SwissButter', 'Abdallah', 'Malak al Taouk',
]);
const kept = existing.filter(e => !brandsToReplace.has(e.brand));

const newRoadster = buildEntries('Roadster Diner',     'lb-road',  ROADSTER);
const newCrepaway = buildEntries('Crepaway',           'lb-crep',  CREPAWAY);
const newDipndip  = buildEntries('Dip n Dip',          'lb-dnd',   DIPNDIP);
const newZwz      = buildEntries('Zaatar w Zeit',      'lb-zwz',   ZWZ);
const newMcdo     = buildEntries("McDonald's Lebanon", 'lb-mcdo',  MCDO);
const newSwissb   = buildEntries('SwissButter',        'lb-sb',    SWISSB);
const newAbd      = buildEntries('Abdallah',           'lb-abd',   ABDALLAH);
const newMalak    = buildEntries('Malak al Taouk',     'lb-mt',    MALAK);

const merged = [
  ...kept,
  ...newRoadster, ...newCrepaway, ...newDipndip, ...newZwz,
  ...newMcdo, ...newSwissb, ...newAbd, ...newMalak,
];

// Pretty-print 2-space indentation matching existing style
const out = 'module.exports = ' + JSON.stringify(merged, null, 2) + ';\n';
fs.writeFileSync(DATA_PATH, out);

console.log(`Wrote ${merged.length} total entries.`);
console.log(`  Kept (other brands):  ${kept.length}`);
console.log(`  Roadster:             ${newRoadster.length}`);
console.log(`  Crepaway:             ${newCrepaway.length}`);
console.log(`  Dip n Dip:            ${newDipndip.length}`);
console.log(`  Zaatar w Zeit:        ${newZwz.length}`);
console.log(`  McDonald's Lebanon:   ${newMcdo.length}`);
console.log(`  SwissButter:          ${newSwissb.length}`);
console.log(`  Abdallah:             ${newAbd.length}`);
console.log(`  Malak al Taouk:       ${newMalak.length}`);
