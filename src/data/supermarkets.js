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
  // ═══════════════════════════════════════════════════════════════════════════
  // AUCHAN (FRANCE)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'auch-salade-pates', name: 'Salade Pâtes Poulet Rôti', brand: 'Auchan', type: ['lunch', 'dinner'], calories: 410, protein: 22, carbs: 48, fat: 14, source: 'supermarket', store: 'Auchan', shoppingItems: ['Salade Pâtes Poulet Rôti — Auchan'], tags: ['salad', 'chicken', 'pasta'], country: 'France' },
  { id: 'auch-hachis-vegan', name: 'Hachis Parmentier Végétal', brand: 'Auchan Végétal', type: ['lunch', 'dinner'], calories: 360, protein: 18, carbs: 36, fat: 16, source: 'supermarket', store: 'Auchan', shoppingItems: ['Hachis Parmentier Végétal — Auchan'], tags: ['vegan', 'potato'], country: 'France', dietary: ['vegan', 'vegetarian'] },
  { id: 'auch-skyr-myrtille', name: 'Skyr Myrtille (pot 150g)', brand: 'Auchan', type: ['snack'], calories: 110, protein: 12, carbs: 14, fat: 0, source: 'supermarket', store: 'Auchan', shoppingItems: ['Skyr Myrtille — Auchan'], tags: ['dairy', 'snack', 'light'], country: 'France' },
  { id: 'auch-blanc-poulet', name: 'Blanc de Poulet (4 tranches)', brand: 'Auchan', type: ['snack', 'lunch'], calories: 140, protein: 30, carbs: 1, fat: 2, source: 'supermarket', store: 'Auchan', shoppingItems: ['Blanc de Poulet 4 Tranches — Auchan'], tags: ['chicken', 'high-protein', 'snack'], country: 'France' },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEBANON SUPERMARKETS (Spinneys, Charcutier Aoun, Carrefour LB)
  // ═══════════════════════════════════════════════════════════════════════════

  // Spinneys
  { id: 'spin-chicken-taouk', name: 'Marinated Chicken Taouk (ready to grill 200g)', brand: 'Spinneys Fresh', type: ['lunch', 'dinner'], calories: 320, protein: 45, carbs: 4, fat: 14, source: 'supermarket', store: 'Spinneys', shoppingItems: ['Marinated Chicken Taouk 200g — Spinneys'], tags: ['chicken', 'high-protein'], country: 'Lebanon', dietary: ['halal', 'keto'] },
  { id: 'spin-hummus', name: 'Traditional Hummus (150g)', brand: 'Spinneys Deli', type: ['snack', 'lunch'], calories: 380, protein: 12, carbs: 22, fat: 28, source: 'supermarket', store: 'Spinneys', shoppingItems: ['Traditional Hummus 150g — Spinneys Deli'], tags: ['vegan', 'dips'], country: 'Lebanon', dietary: ['vegan', 'vegetarian', 'halal'] },
  { id: 'spin-labneh', name: 'Fresh Labneh (100g)', brand: 'Spinneys Dairy', type: ['snack', 'lunch'], calories: 150, protein: 6, carbs: 6, fat: 12, source: 'supermarket', store: 'Spinneys', shoppingItems: ['Fresh Labneh 100g — Spinneys'], tags: ['dairy', 'snack', 'vegetarian'], country: 'Lebanon', dietary: ['vegetarian', 'halal', 'keto'] },

  // Charcutier Aoun
  { id: 'ca-halloumi', name: 'Halloumi Cheese Light (100g)', brand: 'Charcutier Aoun Deli', type: ['lunch', 'snack'], calories: 250, protein: 22, carbs: 2, fat: 16, source: 'supermarket', store: 'Charcutier Aoun', shoppingItems: ['Halloumi Cheese Light 100g — Charcutier Aoun'], tags: ['cheese', 'vegetarian', 'high-protein'], country: 'Lebanon', dietary: ['vegetarian', 'halal', 'keto'] },
  { id: 'ca-rosti-chicken', name: 'Roasted Chicken (Half)', brand: 'Charcutier Aoun Deli', type: ['lunch', 'dinner'], calories: 480, protein: 50, carbs: 0, fat: 28, source: 'supermarket', store: 'Charcutier Aoun', shoppingItems: ['Roasted Chicken Half — Charcutier Aoun'], tags: ['chicken', 'high-protein'], country: 'Lebanon', dietary: ['halal', 'keto'] },
  { id: 'ca-mixed-nuts', name: 'Raw Mixed Nuts (50g)', brand: 'Alrifai (Aoun)', type: ['snack'], calories: 310, protein: 10, carbs: 10, fat: 26, source: 'supermarket', store: 'Charcutier Aoun', shoppingItems: ['Raw Mixed Nuts 50g — Alrifai'], tags: ['nuts', 'vegan', 'snack'], country: 'Lebanon', dietary: ['vegan', 'vegetarian', 'halal', 'keto'] },

  // Carrefour Lebanon
  { id: 'cflb-tuna-can', name: 'Tuna in Water (can)', brand: 'Carrefour', type: ['lunch', 'snack'], calories: 120, protein: 28, carbs: 0, fat: 1, source: 'supermarket', store: 'Carrefour Lebanon', shoppingItems: ['Tuna in Water — Carrefour'], tags: ['fish', 'high-protein', 'light'], country: 'Lebanon', dietary: ['halal', 'keto'] },
  { id: 'cflb-chicken-shawarma', name: 'Chicken Shawarma Wrap (Deli)', brand: 'Carrefour Deli', type: ['lunch', 'dinner'], calories: 520, protein: 32, carbs: 48, fat: 22, source: 'supermarket', store: 'Carrefour Lebanon', shoppingItems: ['Chicken Shawarma Wrap — Carrefour Deli'], tags: ['wrap', 'chicken'], country: 'Lebanon', dietary: ['halal'] },
  { id: 'cflb-greek-yogurt', name: 'Greek Yogurt Plain (150g)', brand: 'Carrefour', type: ['snack'], calories: 100, protein: 15, carbs: 6, fat: 2, source: 'supermarket', store: 'Carrefour Lebanon', shoppingItems: ['Greek Yogurt Plain 150g — Carrefour'], tags: ['dairy', 'snack', 'high-protein'], country: 'Lebanon', dietary: ['vegetarian', 'halal', 'keto'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // USA — SUPERMARKETS (Walmart, Trader Joe's, Whole Foods)
  // ═══════════════════════════════════════════════════════════════════════════

  // Walmart (Great Value)
  { id: 'us-wm-chicken-breast', name: 'Frozen Grilled Chicken Breast Strips (140g)', brand: 'Walmart (Great Value)', type: ['lunch', 'dinner'], calories: 150, protein: 32, carbs: 0, fat: 2, source: 'supermarket', store: 'Walmart', shoppingItems: ['Great Value Grilled Chicken Strips 22oz'], tags: ['chicken', 'high-protein'], country: 'USA' },
  { id: 'us-wm-greek-yogurt', name: 'Nonfat Greek Yogurt Plain (170g)', brand: 'Walmart (Great Value)', type: ['snack'], calories: 90, protein: 16, carbs: 5, fat: 0, source: 'supermarket', store: 'Walmart', shoppingItems: ['Great Value 0% Greek Yogurt 32oz'], tags: ['dairy', 'high-protein'], country: 'USA' },
  { id: 'us-wm-tuna', name: 'Chunk Light Tuna in Water (can)', brand: 'Walmart (Great Value)', type: ['lunch', 'snack'], calories: 100, protein: 22, carbs: 0, fat: 1, source: 'supermarket', store: 'Walmart', shoppingItems: ['Great Value Chunk Light Tuna'], tags: ['fish', 'high-protein'], country: 'USA' },

  // Trader Joe's
  { id: 'us-tj-shrimp-bowl', name: 'Shrimp & Quinoa Bowl', brand: "Trader Joe's", type: ['lunch', 'dinner'], calories: 340, protein: 18, carbs: 42, fat: 12, source: 'supermarket', store: "Trader Joe's", shoppingItems: ["Trader Joe's Shrimp & Quinoa Bowl"], tags: ['bowl', 'fish', 'healthy'], country: 'USA' },
  { id: 'us-tj-chicken-enchiladas', name: 'Chicken Enchiladas (2 pcs)', brand: "Trader Joe's", type: ['lunch', 'dinner'], calories: 360, protein: 24, carbs: 40, fat: 16, source: 'supermarket', store: "Trader Joe's", shoppingItems: ["Trader Joe's Chicken Enchiladas"], tags: ['mexican', 'chicken'], country: 'USA' },

  // Whole Foods (365)
  { id: 'us-wf-salmon', name: 'Atlantic Salmon Fillet (frozen, 150g)', brand: 'Whole Foods (365)', type: ['lunch', 'dinner'], calories: 310, protein: 30, carbs: 0, fat: 21, source: 'supermarket', store: 'Whole Foods', shoppingItems: ['365 Frozen Atlantic Salmon'], tags: ['fish', 'healthy'], country: 'USA' },

  // Target (Good & Gather)
  { id: 'us-tgt-chicken-salad', name: 'Rotisserie Style Chicken Breast (9oz)', brand: 'Target (Good & Gather)', type: ['lunch', 'dinner'], calories: 110, protein: 24, carbs: 0, fat: 1.5, source: 'supermarket', store: 'Target', shoppingItems: ['Good & Gather Rotisserie Chicken Breast'], tags: ['chicken', 'high-protein'], country: 'USA' },
  { id: 'us-tgt-mixed-greens', name: 'Spring Mix Salad (Large)', brand: 'Target (Good & Gather)', type: ['lunch', 'dinner'], calories: 20, protein: 2, carbs: 3, fat: 0, source: 'supermarket', store: 'Target', shoppingItems: ['Good & Gather Spring Mix'], tags: ['salad', 'vegan', 'light'], country: 'USA' },

  // Kroger
  { id: 'us-kr-turkey', name: 'Oven Roasted Turkey Breast (2oz)', brand: 'Kroger', type: ['snack', 'lunch'], calories: 50, protein: 10, carbs: 1, fat: 1, source: 'supermarket', store: 'Kroger', shoppingItems: ['Kroger Deli Sliced Turkey'], tags: ['turkey', 'light'], country: 'USA' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN — SUPERMARKETS (Mercadona, Carrefour Spain)
  // ═══════════════════════════════════════════════════════════════════════════

  // Mercadona (Hacendado)
  { id: 'es-mer-pollo-tiras', name: 'Tiras de Pollo Asado (150g)', brand: 'Mercadona (Hacendado)', type: ['lunch', 'snack'], calories: 180, protein: 38, carbs: 1, fat: 2, source: 'supermarket', store: 'Mercadona', shoppingItems: ['Hacendado Tiras de Pollo asado 99%'], tags: ['chicken', 'high-protein'], country: 'Spain' },
  { id: 'es-mer-hummus', name: 'Hummus de Garbanzos (100g)', brand: 'Mercadona (Hacendado)', type: ['snack', 'lunch'], calories: 280, protein: 8, carbs: 14, fat: 22, source: 'supermarket', store: 'Mercadona', shoppingItems: ['Hacendado Hummus Receta Clásica'], tags: ['vegan', 'vegetarian'], country: 'Spain' },
  { id: 'es-mer-salmorejo', name: 'Salmorejo Fresco (250ml)', brand: 'Mercadona (Hacendado)', type: ['lunch', 'snack'], calories: 180, protein: 4, carbs: 14, fat: 12, source: 'supermarket', store: 'Mercadona', shoppingItems: ['Hacendado Salmorejo Fresco'], tags: ['soup', 'vegan'], country: 'Spain' },

  // Carrefour Spain
  { id: 'es-crf-pavo', name: 'Pechuga de Pavo (100g)', brand: 'Carrefour España', type: ['snack', 'lunch'], calories: 95, protein: 18, carbs: 1, fat: 2, source: 'supermarket', store: 'Carrefour Spain', shoppingItems: ['Carrefour Pechuga de Pavo 90%'], tags: ['turkey', 'light'], country: 'Spain' }

];

const finalSupermarketMeals = supermarketMeals.map(m => {
  if (!m.country) m.country = 'France';
  if (!m.dietary) {
    m.dietary = [];
    if (m.tags?.includes('vegan')) m.dietary.push('vegan', 'vegetarian');
    if (m.tags?.includes('vegetarian')) m.dietary.push('vegetarian');
    if (m.tags?.includes('keto')) m.dietary.push('keto');
    if (m.tags?.includes('gluten-free')) m.dietary.push('gluten-free');
  }
  return m;
});

module.exports = finalSupermarketMeals;
