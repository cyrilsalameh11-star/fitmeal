/**
 * Curated hardcoded list of popular Carrefour and Monoprix ready-meals
 * and staple products with nutritional data.
 * Values per serving/package as labeled.
 * Sources: product labels, Open Food Facts, brand websites.
 * source: "supermarket"
 */
const supermarketMeals = [

  // ═══════════════════════════════════════════════════════════════════════════
  // CARREFOUR — Plats Cuisinés & Prêts à Manger
  // ═══════════════════════════════════════════════════════════════════════════

  // Salades & Bowls
  { id: 'crf-salade-poulet-crudites', name: 'Salade Poulet Crudités', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 350, protein: 28, carbs: 18, fat: 18, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Salade Poulet Crudités — Carrefour'], tags: ['salad', 'chicken', 'light'] },
  { id: 'crf-salade-caesar', name: 'Salade Caesar au Poulet', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 380, protein: 26, carbs: 22, fat: 20, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Salade Caesar au Poulet — Carrefour'], tags: ['salad', 'chicken'] },
  { id: 'crf-taboulé', name: 'Taboulé Libanais', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 290, protein: 7, carbs: 48, fat: 8, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Taboulé Libanais — Carrefour'], tags: ['salad', 'vegan'] },
  { id: 'crf-bowl-quinoa-legumes', name: 'Bowl Quinoa & Légumes Rôtis', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 340, protein: 12, carbs: 46, fat: 11, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Bowl Quinoa & Légumes Rôtis — Carrefour'], tags: ['bowl', 'vegan', 'quinoa'] },
  { id: 'crf-bowl-poulet-riz', name: 'Bowl Poulet Riz Basmati', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 420, protein: 32, carbs: 44, fat: 12, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Bowl Poulet Riz Basmati — Carrefour'], tags: ['bowl', 'chicken'] },

  // Plats chauds / Traiteur
  { id: 'crf-hachis-parmentier', name: 'Hachis Parmentier', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 380, protein: 22, carbs: 32, fat: 17, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Hachis Parmentier — Carrefour'], tags: ['beef', 'potato'] },
  { id: 'crf-poulet-roti', name: 'Poulet Rôti (demi)', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 450, protein: 48, carbs: 0, fat: 22, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Poulet Rôti — Carrefour (demi)'], tags: ['chicken', 'high-protein'] },
  { id: 'crf-lasagnes-bolo', name: 'Lasagnes Bolognaise', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 430, protein: 24, carbs: 36, fat: 22, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Lasagnes Bolognaise — Carrefour'], tags: ['beef', 'pasta'] },
  { id: 'crf-gratin-dauphinois', name: 'Gratin Dauphinois', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 320, protein: 7, carbs: 28, fat: 20, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Gratin Dauphinois — Carrefour'], tags: ['vegetarian', 'potato'] },
  { id: 'crf-poisson-epinards', name: 'Filet de Poisson & Épinards', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 260, protein: 26, carbs: 10, fat: 13, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Filet de Poisson & Épinards — Carrefour'], tags: ['fish', 'light'] },
  { id: 'crf-saumon-legumes', name: 'Pavé de Saumon & Légumes Vapeur', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 350, protein: 30, carbs: 14, fat: 20, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Pavé de Saumon & Légumes Vapeur — Carrefour'], tags: ['fish', 'healthy'] },
  { id: 'crf-wok-boeuf', name: 'Wok Bœuf & Légumes Asiatiques', brand: 'Carrefour', type: ['lunch', 'dinner'], calories: 390, protein: 28, carbs: 38, fat: 14, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Wok Bœuf & Légumes Asiatiques — Carrefour'], tags: ['beef', 'asian'] },

  // Protéines & Snacks
  { id: 'crf-blanc-poulet-tranche', name: 'Blanc de Poulet Tranché (150g)', brand: 'Carrefour', type: ['lunch', 'snack'], calories: 165, protein: 35, carbs: 1, fat: 3, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Blanc de Poulet Tranché 150g — Carrefour'], tags: ['chicken', 'high-protein', 'light'] },
  { id: 'crf-jambon-superieur', name: 'Jambon Supérieur (2 tranches)', brand: 'Carrefour', type: ['snack', 'lunch'], calories: 95, protein: 15, carbs: 1, fat: 3, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Jambon Supérieur — Carrefour'], tags: ['ham', 'light', 'snack'] },
  { id: 'crf-oeufs-durs', name: 'Œufs Durs x2', brand: 'Carrefour', type: ['snack'], calories: 150, protein: 13, carbs: 1, fat: 11, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Œufs — Carrefour (boîte 6)'], tags: ['egg', 'snack', 'high-protein'] },
  { id: 'crf-fromage-blanc-0', name: 'Fromage Blanc 0% (pot 150g)', brand: 'Carrefour', type: ['snack'], calories: 80, protein: 12, carbs: 8, fat: 0, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Fromage Blanc 0% — Carrefour'], tags: ['dairy', 'snack', 'light'] },
  { id: 'crf-skyr-nature', name: 'Skyr Nature (pot 150g)', brand: 'Carrefour', type: ['snack'], calories: 90, protein: 14, carbs: 8, fat: 0, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Skyr Nature — Carrefour'], tags: ['dairy', 'snack', 'high-protein', 'light'] },
  { id: 'crf-thon-naturel', name: 'Thon Naturel (boîte 140g)', brand: 'Carrefour', type: ['lunch', 'snack'], calories: 130, protein: 30, carbs: 0, fat: 2, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Thon Naturel 140g — Carrefour'], tags: ['fish', 'high-protein', 'light'] },

  // Sandwichs & Snacks Rayon Frais
  { id: 'crf-sandwich-poulet-crudites', name: 'Sandwich Poulet Crudités', brand: 'Carrefour', type: ['lunch', 'snack'], calories: 360, protein: 22, carbs: 40, fat: 12, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Sandwich Poulet Crudités — Carrefour'], tags: ['sandwich', 'chicken'] },
  { id: 'crf-sandwich-jambon-beurre', name: 'Baguette Jambon Beurre', brand: 'Carrefour', type: ['lunch', 'snack'], calories: 390, protein: 18, carbs: 42, fat: 16, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Baguette Jambon Beurre — Carrefour'], tags: ['sandwich', 'ham'] },
  { id: 'crf-wrap-poulet', name: 'Wrap Poulet César', brand: 'Carrefour', type: ['lunch'], calories: 400, protein: 24, carbs: 42, fat: 14, source: 'supermarket', store: 'Carrefour', shoppingItems: ['Wrap Poulet César — Carrefour'], tags: ['wrap', 'chicken'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONOPRIX — Gamme Traiteur & Snacking
  // ═══════════════════════════════════════════════════════════════════════════

  // Salades & Bowls — Monoprix Bien Manger
  { id: 'mnp-salade-poulet-avocat', name: 'Salade Poulet & Avocat', brand: 'Monoprix Bien Manger', type: ['lunch', 'dinner'], calories: 370, protein: 27, carbs: 16, fat: 22, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Salade Poulet & Avocat — Monoprix Bien Manger'], tags: ['salad', 'chicken', 'healthy'] },
  { id: 'mnp-bowl-saumon-riz', name: 'Bowl Saumon Riz Complet', brand: 'Monoprix Bien Manger', type: ['lunch', 'dinner'], calories: 420, protein: 28, carbs: 42, fat: 16, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Bowl Saumon Riz Complet — Monoprix'], tags: ['bowl', 'fish', 'healthy'] },
  { id: 'mnp-bowl-falafels', name: 'Bowl Falafels & Quinoa', brand: 'Monoprix Bien Manger', type: ['lunch', 'dinner'], calories: 400, protein: 15, carbs: 52, fat: 15, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Bowl Falafels & Quinoa — Monoprix'], tags: ['bowl', 'vegan'] },
  { id: 'mnp-salade-caesar-poulet', name: 'Salade Caesar Poulet Grillé', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 360, protein: 28, carbs: 18, fat: 18, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Salade Caesar Poulet Grillé — Monoprix'], tags: ['salad', 'chicken'] },
  { id: 'mnp-salade-niçoise', name: 'Salade Niçoise au Thon', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 320, protein: 22, carbs: 20, fat: 16, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Salade Niçoise au Thon — Monoprix'], tags: ['salad', 'fish', 'light'] },
  { id: 'mnp-taboulé', name: 'Taboulé à la Menthe', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 280, protein: 6, carbs: 46, fat: 8, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Taboulé à la Menthe — Monoprix'], tags: ['salad', 'vegan'] },

  // Plats cuisinés — Monoprix
  { id: 'mnp-poulet-tikka', name: 'Poulet Tikka Masala & Riz', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 460, protein: 32, carbs: 48, fat: 14, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Poulet Tikka Masala & Riz — Monoprix'], tags: ['chicken', 'spicy'] },
  { id: 'mnp-saumon-pates', name: 'Saumon Crème & Pâtes Fraîches', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 490, protein: 28, carbs: 48, fat: 20, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Saumon Crème & Pâtes Fraîches — Monoprix'], tags: ['fish', 'pasta'] },
  { id: 'mnp-moussaka', name: 'Moussaka Grecque', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 400, protein: 20, carbs: 30, fat: 22, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Moussaka Grecque — Monoprix'], tags: ['beef', 'mediterranean'] },
  { id: 'mnp-curry-légumes', name: 'Curry de Légumes & Riz Basmati', brand: 'Monoprix Bien Manger', type: ['lunch', 'dinner'], calories: 350, protein: 10, carbs: 54, fat: 10, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Curry de Légumes & Riz Basmati — Monoprix'], tags: ['vegan', 'curry', 'spicy'] },
  { id: 'mnp-steak-pommes-vapeur', name: 'Steak Haché & Pommes Vapeur', brand: 'Monoprix', type: ['lunch', 'dinner'], calories: 410, protein: 30, carbs: 28, fat: 20, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Steak Haché & Pommes Vapeur — Monoprix'], tags: ['beef', 'potato'] },

  // Sandwichs & Wraps — Rayon snacking
  { id: 'mnp-sandwich-thon-crudites', name: 'Sandwich Thon Crudités', brand: 'Monoprix', type: ['lunch', 'snack'], calories: 340, protein: 20, carbs: 38, fat: 11, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Sandwich Thon Crudités — Monoprix'], tags: ['sandwich', 'fish'] },
  { id: 'mnp-sandwich-poulet-curry', name: 'Sandwich Poulet Curry', brand: 'Monoprix', type: ['lunch', 'snack'], calories: 380, protein: 22, carbs: 42, fat: 13, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Sandwich Poulet Curry — Monoprix'], tags: ['sandwich', 'chicken'] },
  { id: 'mnp-wrap-caesar', name: 'Wrap César Poulet Bacon', brand: 'Monoprix', type: ['lunch'], calories: 420, protein: 26, carbs: 44, fat: 16, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Wrap César Poulet Bacon — Monoprix'], tags: ['wrap', 'chicken'] },
  { id: 'mnp-club-sandwich', name: 'Club Sandwich Jambon Emmental', brand: 'Monoprix', type: ['lunch'], calories: 450, protein: 24, carbs: 44, fat: 20, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Club Sandwich Jambon Emmental — Monoprix'], tags: ['sandwich', 'ham'] },

  // Protéines & snacks
  { id: 'mnp-skyr-fraise', name: 'Skyr Fraise (pot 150g)', brand: 'Monoprix', type: ['snack'], calories: 100, protein: 13, carbs: 11, fat: 0, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Skyr Fraise — Monoprix'], tags: ['dairy', 'snack', 'light'] },
  { id: 'mnp-fromage-blanc', name: 'Fromage Blanc 3% (pot 150g)', brand: 'Monoprix', type: ['snack'], calories: 105, protein: 11, carbs: 8, fat: 4, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Fromage Blanc 3% — Monoprix'], tags: ['dairy', 'snack'] },
  { id: 'mnp-oeufs-durs', name: 'Œufs Durs Marinés x2', brand: 'Monoprix', type: ['snack'], calories: 160, protein: 14, carbs: 1, fat: 12, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Œufs Durs Marinés — Monoprix'], tags: ['egg', 'snack', 'high-protein'] },
  { id: 'mnp-jambon-blanc', name: 'Jambon Blanc x3 tranches', brand: 'Monoprix', type: ['snack', 'lunch'], calories: 130, protein: 20, carbs: 1, fat: 5, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Jambon Blanc — Monoprix (barquette 3 tranches)'], tags: ['ham', 'light', 'snack'] },
  { id: 'mnp-compote-pomme', name: 'Compote Pomme sans sucre ajouté', brand: 'Monoprix', type: ['snack'], calories: 70, protein: 0, carbs: 17, fat: 0, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Compote Pomme — Monoprix (sans sucre)'], tags: ['snack', 'fruit', 'light'] },
  { id: 'mnp-amandes-noisettes', name: 'Mix Amandes & Noisettes (30g)', brand: 'Monoprix', type: ['snack'], calories: 185, protein: 5, carbs: 5, fat: 17, source: 'supermarket', store: 'Monoprix', shoppingItems: ['Mix Amandes & Noisettes — Monoprix'], tags: ['snack', 'nuts'] },
];

module.exports = supermarketMeals;
