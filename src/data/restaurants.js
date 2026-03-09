/**
 * Hardcoded nutritional data for international restaurant chains.
 * All values are per serving / per menu item as sold.
 * Sources: official restaurant menus, fankal.com, parlons-sport.fr, fitia.app, snapcalorie.com
 * source: "restaurant"
 */
const restaurantMeals = [

  // ═══════════════════════════════════════════════════════════════════════════
  // FRANCE
  // ═══════════════════════════════════════════════════════════════════════════

  // McDonald's France
  { id: 'fr-mcd-hamburger', name: 'Hamburger', brand: "McDonald's France", type: ['snack', 'lunch'], calories: 261, protein: 13, carbs: 32, fat: 9, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-mcd-cheeseburger', name: 'Cheeseburger', brand: "McDonald's France", type: ['snack', 'lunch'], calories: 303, protein: 16, carbs: 33, fat: 12, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-mcd-double-cheese', name: 'Double Cheeseburger', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 440, protein: 29, carbs: 34, fat: 22, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-mcd-big-mac', name: 'Big Mac', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 508, protein: 27, carbs: 43, fat: 25, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-mcd-mcchicken', name: 'McChicken', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 439, protein: 21, carbs: 41, fat: 22, source: 'restaurant', tags: ['burger', 'chicken'], country: 'France' },
  { id: 'fr-mcd-royal-cheese', name: 'Royal Cheese', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 518, protein: 29, carbs: 40, fat: 28, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-mcd-filet-o-fish', name: 'Filet-O-Fish', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 327, protein: 15, carbs: 35, fat: 14, source: 'restaurant', tags: ['burger', 'fish'], country: 'France' },
  { id: 'fr-mcd-mcwrap-poulet', name: 'McWrap Poulet Croustillant', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 498, protein: 31, carbs: 44, fat: 21, source: 'restaurant', tags: ['wrap', 'chicken'], country: 'France' },
  { id: 'fr-mcd-salad-caesar', name: 'Salade Caesar Poulet', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 405, protein: 27, carbs: 20, fat: 24, source: 'restaurant', tags: ['salad', 'chicken'], country: 'France' },
  { id: 'fr-mcd-nuggets-9', name: 'Chicken McNuggets x9', brand: "McDonald's France", type: ['snack', 'lunch'], calories: 420, protein: 25, carbs: 27, fat: 24, source: 'restaurant', tags: ['chicken', 'snack'], country: 'France' },

  // Burger King France
  { id: 'fr-bk-whopper', name: 'Whopper', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 629, protein: 28, carbs: 49, fat: 35, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-bk-steakhouse', name: 'Steakhouse Burger', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 829, protein: 40, carbs: 56, fat: 50, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-bk-cheddar-lover', name: 'Cheddar Lover Burger', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 640, protein: 30, carbs: 42, fat: 38, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-bk-chicken-louisiane', name: 'Chicken Louisiane Steakhouse', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 846, protein: 42, carbs: 62, fat: 46, source: 'restaurant', tags: ['burger', 'chicken'], country: 'France' },

  // KFC France
  { id: 'fr-kfc-boxmaster', name: 'Boxmaster', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 657, protein: 36, carbs: 56, fat: 33, source: 'restaurant', tags: ['burger', 'chicken'], country: 'France' },
  { id: 'fr-kfc-tenders-5', name: 'Tenders x5', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 464, protein: 37, carbs: 32, fat: 21, source: 'restaurant', tags: ['chicken', 'high-protein'], country: 'France' },
  { id: 'fr-kfc-twister', name: 'Twister Poulet', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 498, protein: 26, carbs: 50, fat: 21, source: 'restaurant', tags: ['wrap', 'chicken'], country: 'France' },

  // Subway France
  { id: 'fr-sub-poulet-teriyaki', name: 'Sub Poulet Teriyaki 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 323, protein: 24, carbs: 43, fat: 5, source: 'restaurant', tags: ['sub', 'chicken'], country: 'France' },
  { id: 'fr-sub-steak-cheese', name: 'Steak & Cheese 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 303, protein: 21, carbs: 38, fat: 8, source: 'restaurant', tags: ['sub', 'beef'], country: 'France' },
  { id: 'fr-sub-turkey-ham', name: 'Sub Dinde & Jambon 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 297, protein: 22, carbs: 38, fat: 5, source: 'restaurant', tags: ['sub', 'turkey'], country: 'France' },

  // Prêt à Manger France
  { id: 'fr-pret-chicken-avocado', name: 'Sandwich Poulet Avocat', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 430, protein: 28, carbs: 36, fat: 18, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'France' },
  { id: 'fr-pret-protein-bowl', name: 'Bowl Protéiné Poulet & Quinoa', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 490, protein: 38, carbs: 42, fat: 14, source: 'restaurant', tags: ['bowl', 'chicken', 'high-protein'], country: 'France' },
  { id: 'fr-pret-salmon-bowl', name: 'Bowl Saumon Riz Noir', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 510, protein: 32, carbs: 50, fat: 20, source: 'restaurant', tags: ['bowl', 'fish'], country: 'France' },

  // Exki France
  { id: 'fr-exki-bowl-poulet', name: 'Bowl Poulet Rôti & Légumes', brand: 'Exki', type: ['lunch', 'dinner'], calories: 460, protein: 38, carbs: 35, fat: 16, source: 'restaurant', tags: ['bowl', 'chicken'], country: 'France' },
  { id: 'fr-exki-le-jean', name: 'Sandwich Le Jean (Jambon, Comté)', brand: 'Exki', type: ['lunch', 'snack'], calories: 447, protein: 21, carbs: 40, fat: 21, source: 'restaurant', tags: ['sandwich', 'ham'], country: 'France' },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEBANON
  // ═══════════════════════════════════════════════════════════════════════════

  // Crepaway Lebanon
  { id: 'lb-crep-beatrice', name: 'Beatrice Crepe (Chicken, Mushrooms, Cheese)', brand: 'Crepaway', type: ['lunch', 'dinner'], calories: 540, protein: 32, carbs: 45, fat: 26, source: 'restaurant', tags: ['crepe', 'chicken'], country: 'Lebanon' },
  { id: 'lb-crep-josephine', name: 'Josephine Crepe (Ham, Oregano, Cheese)', brand: 'Crepaway', type: ['lunch', 'dinner'], calories: 480, protein: 24, carbs: 42, fat: 22, source: 'restaurant', tags: ['crepe', 'ham'], country: 'Lebanon' },
  { id: 'lb-crep-plant-power', name: 'Plant Power Burger', brand: 'Crepaway', type: ['lunch', 'dinner'], calories: 450, protein: 22, carbs: 50, fat: 18, source: 'restaurant', tags: ['burger', 'vegan', 'vegetarian'], country: 'Lebanon' },
  { id: 'lb-crep-magali', name: 'Magali Crepe (Belgian Chocolate)', brand: 'Crepaway', type: ['dessert'], calories: 450, protein: 6, carbs: 58, fat: 22, source: 'restaurant', tags: ['crepe', 'dessert', 'sweet'], country: 'Lebanon' },
  { id: 'lb-crep-martine', name: 'Martine Crepe (Choc, Banana, Nuts)', brand: 'Crepaway', type: ['dessert', 'snack'], calories: 520, protein: 8, carbs: 62, fat: 26, source: 'restaurant', tags: ['crepe', 'dessert', 'sweet'], country: 'Lebanon' },
  { id: 'lb-crep-michele', name: 'Michele Crepe (White Choc, Strawberry)', brand: 'Crepaway', type: ['dessert'], calories: 430, protein: 5, carbs: 55, fat: 20, source: 'restaurant', tags: ['crepe', 'dessert', 'sweet'], country: 'Lebanon' },
  { id: 'lb-crep-chicken-sub', name: 'Chicken Sub (Marinated Breast)', brand: 'Crepaway', type: ['lunch', 'dinner'], calories: 510, protein: 36, carbs: 48, fat: 18, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'Lebanon' },
  { id: 'lb-crep-caesar', name: 'Salad Caesar (with Chicken)', brand: 'Crepaway', type: ['lunch', 'dinner'], calories: 420, protein: 28, carbs: 18, fat: 24, source: 'restaurant', tags: ['salad', 'chicken'], country: 'Lebanon' },

  // Abdallah Lebanon
  { id: 'lb-abd-taouk-platter', name: 'Shish Taouk Platter (Chicken, Garlic, Fries)', brand: 'Abdallah', type: ['lunch', 'dinner'], calories: 550, protein: 42, carbs: 50, fat: 22, source: 'restaurant', tags: ['chicken', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-abd-kofta-platter', name: 'Kofta Platter (Grilled Meat)', brand: 'Abdallah', type: ['lunch', 'dinner'], calories: 580, protein: 38, carbs: 35, fat: 32, source: 'restaurant', tags: ['beef', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-abd-hummus-meat', name: 'Hummus with Sautéed Meat', brand: 'Abdallah', type: ['lunch', 'dinner', 'snack'], calories: 450, protein: 22, carbs: 28, fat: 28, source: 'restaurant', tags: ['lebanese', 'hummus', 'beef'], country: 'Lebanon' },
  { id: 'lb-abd-kibbeh', name: 'Fried Kibbeh (per piece)', brand: 'Abdallah', type: ['snack'], calories: 160, protein: 7, carbs: 14, fat: 9, source: 'restaurant', tags: ['snack', 'lebanese', 'beef'], country: 'Lebanon' },
  { id: 'lb-abd-baklava', name: 'Assorted Baklava (2 pieces)', brand: 'Abdallah', type: ['dessert'], calories: 240, protein: 3, carbs: 32, fat: 12, source: 'restaurant', tags: ['dessert', 'lebanese', 'sweet'], country: 'Lebanon' },
  { id: 'lb-abd-nammoura', name: 'Nammoura (Basmoussa, per piece)', brand: 'Abdallah', type: ['dessert'], calories: 180, protein: 3, carbs: 30, fat: 6, source: 'restaurant', tags: ['dessert', 'lebanese', 'sweet'], country: 'Lebanon' },
  { id: 'lb-abd-fatteh', name: 'Fatteh (Chickpeas, Yogurt, Nuts)', brand: 'Abdallah', type: ['lunch'], calories: 420, protein: 18, carbs: 45, fat: 20, source: 'restaurant', tags: ['lebanese', 'vegetarian'], country: 'Lebanon' },

  // Malak al Taouk Lebanon
  { id: 'lb-mt-sand-classic', name: 'Classic Tawouk Sandwich', brand: 'Malak al Taouk', type: ['lunch', 'snack', 'dinner'], calories: 650, protein: 45, carbs: 55, fat: 28, source: 'restaurant', tags: ['sandwich', 'chicken', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-mt-platter', name: 'Tawouk Platter (Chicken, Fries, Garlic)', brand: 'Malak al Taouk', type: ['lunch', 'dinner'], calories: 950, protein: 55, carbs: 70, fat: 45, source: 'restaurant', tags: ['chicken', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-mt-burger', name: 'Malak Burger', brand: 'Malak al Taouk', type: ['lunch', 'dinner'], calories: 850, protein: 35, carbs: 65, fat: 50, source: 'restaurant', tags: ['burger', 'beef'], country: 'Lebanon' },
  { id: 'lb-mt-franji', name: 'Franji Tawouk (Baguette)', brand: 'Malak al Taouk', type: ['lunch', 'snack'], calories: 580, protein: 42, carbs: 50, fat: 22, source: 'restaurant', tags: ['sandwich', 'chicken', 'lebanese'], country: 'Lebanon' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN
  // ═══════════════════════════════════════════════════════════════════════════

  // VIPS Spain
  { id: 'es-vips-club', name: 'VIPS Club Sandwich', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 770, protein: 25, carbs: 62, fat: 48, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'Spain' },
  { id: 'es-vips-tortilla', name: 'Tortilla de Claras (Spinach & Mushroom)', brand: 'VIPS', type: ['lunch', 'snack'], calories: 172, protein: 16, carbs: 19, fat: 4, source: 'restaurant', tags: ['egg', 'healthy', 'vegetarian'], country: 'Spain' },
  { id: 'es-vips-cottage', name: 'Pechugas con Cottage (Chicken breast)', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 298, protein: 43, carbs: 14, fat: 8, source: 'restaurant', tags: ['chicken', 'high-protein', 'healthy'], country: 'Spain' },
  { id: 'es-vips-ribs', name: 'BBQ Ribs (Half Rack)', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 550, protein: 52, carbs: 2, fat: 37, source: 'restaurant', tags: ['pork', 'high-protein'], country: 'Spain' },
  { id: 'es-vips-caesar', name: 'Ensalada Cesar', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 460, protein: 25, carbs: 34, fat: 25, source: 'restaurant', tags: ['salad', 'chicken'], country: 'Spain' },
  { id: 'es-vips-pampera', name: 'Burger Pampera', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 850, protein: 40, carbs: 52, fat: 55, source: 'restaurant', tags: ['burger', 'beef'], country: 'Spain' },

  // 100 Montaditos Spain
  { id: 'es-100m-club', name: 'Montadito Club', brand: '100 Montaditos', type: ['snack', 'lunch'], calories: 190, protein: 9, carbs: 22, fat: 8, source: 'restaurant', tags: ['tapas', 'chicken'], country: 'Spain' },
  { id: 'es-100m-lacon', name: 'Montadito Lacon y Queso', brand: '100 Montaditos', type: ['snack', 'lunch'], calories: 160, protein: 7, carbs: 20, fat: 6, source: 'restaurant', tags: ['tapas', 'pork'], country: 'Spain' },
  { id: 'es-100m-chicken', name: 'Montadito Pollo Kebab', brand: '100 Montaditos', type: ['snack', 'lunch'], calories: 240, protein: 12, carbs: 28, fat: 9, source: 'restaurant', tags: ['tapas', 'chicken'], country: 'Spain' },
  { id: 'es-100m-hotdog', name: 'Mini Perrito con Cebolla', brand: '100 Montaditos', type: ['snack'], calories: 210, protein: 8, carbs: 22, fat: 10, source: 'restaurant', tags: ['tapas'], country: 'Spain' },

  // Goiko Spain
  { id: 'es-goiko-kevin', name: 'Kevin Bacon Burger', brand: 'Goiko', type: ['lunch', 'dinner'], calories: 1100, protein: 55, carbs: 45, fat: 75, source: 'restaurant', tags: ['burger', 'beef'], country: 'Spain' },

  // ═══════════════════════════════════════════════════════════════════════════
  // USA (Consolidated)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'us-chip-chicken-bowl', name: 'Chicken Burrito Bowl', brand: 'Chipotle', type: ['lunch', 'dinner'], calories: 660, protein: 52, carbs: 70, fat: 18, source: 'restaurant', tags: ['bowl', 'chicken', 'healthy'], country: 'USA' },
  { id: 'us-sg-harvest-bowl', name: 'Harvest Bowl', brand: 'Sweetgreen', type: ['lunch', 'dinner'], calories: 705, protein: 36, carbs: 68, fat: 34, source: 'restaurant', tags: ['salad', 'bowl', 'chicken'], country: 'USA' },
  { id: 'us-mcd-quarter-pounder', name: 'Quarter Pounder with Cheese', brand: "McDonald's USA", type: ['lunch', 'dinner'], calories: 520, protein: 30, carbs: 42, fat: 26, source: 'restaurant', tags: ['burger', 'beef'], country: 'USA' },
  { id: 'us-cfa-sandwich', name: 'Chicken Sandwich', brand: 'Chick-fil-A', type: ['lunch', 'dinner'], calories: 440, protein: 28, carbs: 41, fat: 19, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'USA' },


  // ═══════════════════════════════════════════════════════════════════════════
  // FRANCE — NEW BRANDS
  // ═══════════════════════════════════════════════════════════════════════════

  // Quick France
  { id: 'fr-quick-giant-cheese', name: 'Giant Cheese', brand: 'Quick', type: ['lunch', 'dinner'], calories: 680, protein: 35, carbs: 52, fat: 38, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-quick-big-bacon', name: 'Big Bacon', brand: 'Quick', type: ['lunch', 'dinner'], calories: 720, protein: 40, carbs: 50, fat: 42, source: 'restaurant', tags: ['burger', 'beef'], country: 'France' },
  { id: 'fr-quick-chicken', name: 'Chicken Quick Burger', brand: 'Quick', type: ['lunch', 'dinner'], calories: 580, protein: 30, carbs: 48, fat: 28, source: 'restaurant', tags: ['burger', 'chicken'], country: 'France' },
  { id: 'fr-quick-twistos', name: 'Twistos Cheese', brand: 'Quick', type: ['lunch', 'snack'], calories: 490, protein: 22, carbs: 44, fat: 26, source: 'restaurant', tags: ['snack', 'chicken'], country: 'France' },

  // O'Tacos France
  { id: 'fr-ot-xl-poulet', name: 'O\'Tacos XL Poulet-Fromage', brand: "O'Tacos", type: ['lunch', 'dinner'], calories: 920, protein: 48, carbs: 85, fat: 42, source: 'restaurant', tags: ['tacos', 'chicken'], country: 'France' },
  { id: 'fr-ot-m-boeuf', name: 'O\'Tacos M Bœuf', brand: "O'Tacos", type: ['lunch', 'dinner'], calories: 700, protein: 36, carbs: 65, fat: 30, source: 'restaurant', tags: ['tacos', 'beef'], country: 'France' },
  { id: 'fr-ot-l-mixte', name: 'O\'Tacos L Mixte', brand: "O'Tacos", type: ['lunch', 'dinner'], calories: 810, protein: 42, carbs: 74, fat: 36, source: 'restaurant', tags: ['tacos', 'chicken'], country: 'France' },

  // Chicken Street France
  { id: 'fr-cs-burger', name: 'Street Burger Poulet', brand: 'Chicken Street', type: ['lunch', 'dinner'], calories: 620, protein: 38, carbs: 46, fat: 28, source: 'restaurant', tags: ['burger', 'chicken'], country: 'France' },
  { id: 'fr-cs-strips', name: 'Chicken Strips x4', brand: 'Chicken Street', type: ['lunch', 'snack'], calories: 480, protein: 34, carbs: 36, fat: 20, source: 'restaurant', tags: ['chicken', 'high-protein'], country: 'France' },
  { id: 'fr-cs-bowl', name: 'Bowl Poulet Riz', brand: 'Chicken Street', type: ['lunch', 'dinner'], calories: 550, protein: 42, carbs: 52, fat: 18, source: 'restaurant', tags: ['bowl', 'chicken', 'high-protein'], country: 'France' },

  // Peppe Chicken France
  { id: 'fr-peppe-spicy', name: 'Peppe Burger Spicy', brand: 'Peppe Chicken', type: ['lunch', 'dinner'], calories: 640, protein: 36, carbs: 50, fat: 30, source: 'restaurant', tags: ['burger', 'chicken'], country: 'France' },
  { id: 'fr-peppe-thighs', name: 'Chicken Thighs x3', brand: 'Peppe Chicken', type: ['lunch', 'dinner'], calories: 520, protein: 40, carbs: 28, fat: 26, source: 'restaurant', tags: ['chicken', 'high-protein'], country: 'France' },
  { id: 'fr-peppe-sandwich', name: 'Peppe Sandwich', brand: 'Peppe Chicken', type: ['lunch', 'snack'], calories: 570, protein: 32, carbs: 44, fat: 24, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'France' },

  // Boulangerie Paul
  { id: 'fr-paul-croissant', name: 'Croissant au Beurre', brand: 'Boulangerie Paul', type: ['snack'], calories: 280, protein: 5, carbs: 30, fat: 16, source: 'restaurant', tags: ['pastry', 'snack'], country: 'France' },
  { id: 'fr-paul-pain-choc', name: 'Pain au Chocolat', brand: 'Boulangerie Paul', type: ['snack'], calories: 320, protein: 6, carbs: 34, fat: 18, source: 'restaurant', tags: ['pastry', 'snack'], country: 'France' },
  { id: 'fr-paul-jambon', name: 'Sandwich Jambon Beurre', brand: 'Boulangerie Paul', type: ['lunch', 'snack'], calories: 420, protein: 18, carbs: 42, fat: 18, source: 'restaurant', tags: ['sandwich', 'ham'], country: 'France' },
  { id: 'fr-paul-quiche', name: 'Quiche Lorraine', brand: 'Boulangerie Paul', type: ['lunch', 'snack'], calories: 480, protein: 16, carbs: 32, fat: 32, source: 'restaurant', tags: ['pastry', 'egg'], country: 'France' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN — NEW BRANDS
  // ═══════════════════════════════════════════════════════════════════════════

  // McDonald's Spain
  { id: 'es-mcd-mcextreme', name: 'McExtreme BBQ', brand: "McDonald's Spain", type: ['lunch', 'dinner'], calories: 730, protein: 38, carbs: 58, fat: 38, source: 'restaurant', tags: ['burger', 'beef'], country: 'Spain' },
  { id: 'es-mcd-mcpollo', name: 'McPollo', brand: "McDonald's Spain", type: ['lunch', 'dinner'], calories: 480, protein: 26, carbs: 44, fat: 20, source: 'restaurant', tags: ['burger', 'chicken'], country: 'Spain' },
  { id: 'es-mcd-big-mac', name: 'Big Mac', brand: "McDonald's Spain", type: ['lunch', 'dinner'], calories: 508, protein: 27, carbs: 43, fat: 25, source: 'restaurant', tags: ['burger', 'beef'], country: 'Spain' },
  { id: 'es-mcd-salad', name: 'Ensalada Pollo Plancha', brand: "McDonald's Spain", type: ['lunch'], calories: 320, protein: 30, carbs: 18, fat: 14, source: 'restaurant', tags: ['salad', 'chicken'], country: 'Spain' },

  // KFC Spain
  { id: 'es-kfc-twister', name: 'Twister Original', brand: 'KFC Spain', type: ['lunch', 'dinner'], calories: 510, protein: 26, carbs: 52, fat: 22, source: 'restaurant', tags: ['wrap', 'chicken'], country: 'Spain' },
  { id: 'es-kfc-bucket', name: 'Bucket Original 6pc', brand: 'KFC Spain', type: ['lunch', 'dinner'], calories: 720, protein: 50, carbs: 38, fat: 38, source: 'restaurant', tags: ['chicken', 'high-protein'], country: 'Spain' },
  { id: 'es-kfc-zinger', name: 'Zinger Burger', brand: 'KFC Spain', type: ['lunch', 'dinner'], calories: 560, protein: 30, carbs: 48, fat: 24, source: 'restaurant', tags: ['burger', 'chicken'], country: 'Spain' },
  { id: 'es-kfc-tenders', name: 'Tenders x3', brand: 'KFC Spain', type: ['lunch', 'snack'], calories: 285, protein: 22, carbs: 20, fat: 12, source: 'restaurant', tags: ['chicken', 'high-protein'], country: 'Spain' },

  // Telepizza Spain
  { id: 'es-tel-bbq', name: 'Pizza Barbacoa Mediana (2 trozos)', brand: 'Telepizza', type: ['lunch', 'dinner'], calories: 520, protein: 26, carbs: 58, fat: 20, source: 'restaurant', tags: ['pizza', 'beef'], country: 'Spain' },
  { id: 'es-tel-4q', name: 'Pizza 4 Quesos Mediana (2 trozos)', brand: 'Telepizza', type: ['lunch', 'dinner'], calories: 560, protein: 24, carbs: 56, fat: 24, source: 'restaurant', tags: ['pizza'], country: 'Spain' },
  { id: 'es-tel-pollo', name: 'Pizza Pollo BBQ Mediana (2 trozos)', brand: 'Telepizza', type: ['lunch', 'dinner'], calories: 490, protein: 28, carbs: 54, fat: 18, source: 'restaurant', tags: ['pizza', 'chicken'], country: 'Spain' },
  { id: 'es-tel-alitas', name: 'Alitas de Pollo x8', brand: 'Telepizza', type: ['lunch', 'dinner', 'snack'], calories: 540, protein: 44, carbs: 12, fat: 34, source: 'restaurant', tags: ['chicken', 'high-protein'], country: 'Spain' },

  // Carrefour Spain
  { id: 'es-crf-pollo', name: 'Pollo a la Plancha Ready-Meal', brand: 'Carrefour Spain', type: ['lunch', 'dinner'], calories: 280, protein: 38, carbs: 8, fat: 11, source: 'restaurant', tags: ['chicken', 'healthy'], country: 'Spain' },
  { id: 'es-crf-ensalada', name: 'Ensalada César Preparada', brand: 'Carrefour Spain', type: ['lunch', 'snack'], calories: 360, protein: 22, carbs: 20, fat: 22, source: 'restaurant', tags: ['salad', 'chicken'], country: 'Spain' },
  { id: 'es-crf-merluza', name: 'Filete de Merluza (150g)', brand: 'Carrefour Spain', type: ['lunch', 'dinner'], calories: 130, protein: 26, carbs: 0, fat: 2, source: 'restaurant', tags: ['fish', 'healthy'], country: 'Spain' },

  // Alcampo Spain
  { id: 'es-alc-pavo', name: 'Pechugas de Pavo (100g)', brand: 'Alcampo', type: ['lunch', 'dinner', 'snack'], calories: 105, protein: 22, carbs: 0, fat: 2, source: 'restaurant', tags: ['turkey', 'healthy', 'high-protein'], country: 'Spain' },
  { id: 'es-alc-arroz', name: 'Arroz con Pollo Ready', brand: 'Alcampo', type: ['lunch', 'dinner'], calories: 400, protein: 28, carbs: 50, fat: 10, source: 'restaurant', tags: ['chicken'], country: 'Spain' },
  { id: 'es-alc-hummus', name: 'Hummus Clásico (200g)', brand: 'Alcampo', type: ['lunch', 'snack'], calories: 320, protein: 12, carbs: 28, fat: 18, source: 'restaurant', tags: ['vegetarian'], country: 'Spain' },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEBANON — NEW BRANDS
  // ═══════════════════════════════════════════════════════════════════════════

  // Roadster Diner Lebanon
  { id: 'lb-road-burger', name: 'Classic Roadster Burger', brand: 'Roadster Diner', type: ['lunch', 'dinner'], calories: 880, protein: 45, carbs: 62, fat: 52, source: 'restaurant', tags: ['burger', 'beef'], country: 'Lebanon' },
  { id: 'lb-road-wrap', name: 'BBQ Chicken Wrap', brand: 'Roadster Diner', type: ['lunch', 'dinner'], calories: 660, protein: 40, carbs: 54, fat: 28, source: 'restaurant', tags: ['wrap', 'chicken'], country: 'Lebanon' },
  { id: 'lb-road-shawarma', name: 'Shawarma Plate', brand: 'Roadster Diner', type: ['lunch', 'dinner'], calories: 750, protein: 48, carbs: 60, fat: 30, source: 'restaurant', tags: ['chicken', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-road-salad', name: 'Crispy Chicken Salad', brand: 'Roadster Diner', type: ['lunch'], calories: 480, protein: 32, carbs: 28, fat: 26, source: 'restaurant', tags: ['salad', 'chicken'], country: 'Lebanon' },
  { id: 'lb-road-halloumi', name: 'Halloumi Burger', brand: 'Roadster Diner', type: ['lunch', 'dinner'], calories: 720, protein: 32, carbs: 58, fat: 38, source: 'restaurant', tags: ['burger', 'vegetarian'], country: 'Lebanon' },

  // McDonald's Lebanon
  { id: 'lb-mcd-big-mac', name: 'Big Mac', brand: "McDonald's Lebanon", type: ['lunch', 'dinner'], calories: 508, protein: 27, carbs: 43, fat: 25, source: 'restaurant', tags: ['burger', 'beef'], country: 'Lebanon' },
  { id: 'lb-mcd-mc-arabia', name: 'McArabia Chicken', brand: "McDonald's Lebanon", type: ['lunch', 'dinner'], calories: 620, protein: 38, carbs: 56, fat: 26, source: 'restaurant', tags: ['wrap', 'chicken', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-mcd-mcfalafel', name: 'McFalafel', brand: "McDonald's Lebanon", type: ['lunch', 'dinner'], calories: 480, protein: 18, carbs: 58, fat: 20, source: 'restaurant', tags: ['burger', 'vegetarian'], country: 'Lebanon' },
  { id: 'lb-mcd-nuggets', name: 'Chicken McNuggets x6', brand: "McDonald's Lebanon", type: ['snack', 'lunch'], calories: 280, protein: 17, carbs: 18, fat: 16, source: 'restaurant', tags: ['chicken', 'snack'], country: 'Lebanon' },

  // Zaatar w Zeit Lebanon
  { id: 'lb-zwz-zaatar', name: "Man'oushé Zaatar", brand: 'Zaatar w Zeit', type: ['lunch', 'snack'], calories: 420, protein: 10, carbs: 62, fat: 16, source: 'restaurant', tags: ['lebanese', 'vegetarian'], country: 'Lebanon' },
  { id: 'lb-zwz-cheese', name: "Man'oushé Cheese", brand: 'Zaatar w Zeit', type: ['lunch', 'snack'], calories: 480, protein: 18, carbs: 60, fat: 20, source: 'restaurant', tags: ['lebanese'], country: 'Lebanon' },
  { id: 'lb-zwz-chicken-wrap', name: 'Chicken & Garlic Wrap', brand: 'Zaatar w Zeit', type: ['lunch', 'dinner'], calories: 580, protein: 38, carbs: 52, fat: 22, source: 'restaurant', tags: ['wrap', 'chicken', 'lebanese'], country: 'Lebanon' },
  { id: 'lb-zwz-grilled', name: 'Grilled Chicken Platter', brand: 'Zaatar w Zeit', type: ['lunch', 'dinner'], calories: 680, protein: 50, carbs: 55, fat: 24, source: 'restaurant', tags: ['chicken', 'lebanese', 'high-protein'], country: 'Lebanon' },
  { id: 'lb-zwz-fatayer', name: 'Spinach & Cheese Fatayer', brand: 'Zaatar w Zeit', type: ['snack', 'lunch'], calories: 340, protein: 12, carbs: 44, fat: 14, source: 'restaurant', tags: ['lebanese', 'vegetarian'], country: 'Lebanon' },

  // Bartartine Lebanon
  { id: 'lb-bart-chicken-avo', name: 'Chicken Avocado Sandwich', brand: 'Bartartine', type: ['lunch', 'dinner'], calories: 560, protein: 36, carbs: 44, fat: 24, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'Lebanon' },
  { id: 'lb-bart-salmon-bagel', name: 'Smoked Salmon Bagel', brand: 'Bartartine', type: ['lunch', 'snack'], calories: 490, protein: 28, carbs: 46, fat: 20, source: 'restaurant', tags: ['sandwich', 'fish'], country: 'Lebanon' },
  { id: 'lb-bart-tuna-melt', name: 'Tuna Melt', brand: 'Bartartine', type: ['lunch', 'dinner'], calories: 520, protein: 30, carbs: 42, fat: 24, source: 'restaurant', tags: ['sandwich', 'fish'], country: 'Lebanon' },
  { id: 'lb-bart-caesar', name: 'Caesar Salad (Chicken)', brand: 'Bartartine', type: ['lunch'], calories: 420, protein: 32, carbs: 18, fat: 24, source: 'restaurant', tags: ['salad', 'chicken'], country: 'Lebanon' },
  { id: 'lb-bart-granola', name: 'Granola Bowl with Yogurt', brand: 'Bartartine', type: ['snack'], calories: 380, protein: 14, carbs: 52, fat: 12, source: 'restaurant', tags: ['healthy', 'vegetarian'], country: 'Lebanon' },

  // Dip n Dip Lebanon (Desserts)
  { id: 'lb-dnd-fondue-choc', name: 'Chocolate Fondue (2 pax)', brand: 'Dip n Dip', type: ['dessert'], calories: 820, protein: 14, carbs: 92, fat: 46, source: 'restaurant', tags: ['dessert', 'chocolate', 'sweet'], country: 'Lebanon' },
  { id: 'lb-dnd-waffle', name: 'Belgian Waffle with Nutella', brand: 'Dip n Dip', type: ['dessert', 'snack'], calories: 560, protein: 8, carbs: 72, fat: 28, source: 'restaurant', tags: ['dessert', 'sweet', 'chocolate'], country: 'Lebanon' },
  { id: 'lb-dnd-strawberry-fondue', name: 'Strawberry Fondue', brand: 'Dip n Dip', type: ['dessert'], calories: 680, protein: 10, carbs: 82, fat: 34, source: 'restaurant', tags: ['dessert', 'sweet'], country: 'Lebanon' },
  { id: 'lb-dnd-crepe-dark', name: 'Crepe with Dark Chocolate', brand: 'Dip n Dip', type: ['dessert', 'snack'], calories: 420, protein: 6, carbs: 56, fat: 20, source: 'restaurant', tags: ['dessert', 'chocolate', 'sweet', 'crepe'], country: 'Lebanon' },
  { id: 'lb-dnd-cookie-dough', name: 'Cookie Dough Sundae', brand: 'Dip n Dip', type: ['dessert'], calories: 640, protein: 9, carbs: 80, fat: 34, source: 'restaurant', tags: ['dessert', 'sweet'], country: 'Lebanon' },

  // Pinkberry Lebanon (Frozen Yogurt)
  { id: 'lb-pink-original-s', name: 'Original Frozen Yogurt (Small)', brand: 'Pinkberry', type: ['dessert', 'snack'], calories: 100, protein: 3, carbs: 22, fat: 0, source: 'restaurant', tags: ['dessert', 'frozen-yogurt', 'low-calorie'], country: 'Lebanon' },
  { id: 'lb-pink-mango-m', name: 'Mango Frozen Yogurt (Medium)', brand: 'Pinkberry', type: ['dessert', 'snack'], calories: 160, protein: 4, carbs: 36, fat: 0, source: 'restaurant', tags: ['dessert', 'frozen-yogurt'], country: 'Lebanon' },
  { id: 'lb-pink-strawberry-l', name: 'Strawberry FroYo (Large)', brand: 'Pinkberry', type: ['dessert'], calories: 210, protein: 5, carbs: 46, fat: 0, source: 'restaurant', tags: ['dessert', 'frozen-yogurt'], country: 'Lebanon' },
  { id: 'lb-pink-granola', name: 'FroYo with Granola & Honey', brand: 'Pinkberry', type: ['dessert', 'snack'], calories: 320, protein: 8, carbs: 62, fat: 4, source: 'restaurant', tags: ['dessert', 'frozen-yogurt'], country: 'Lebanon' },

  // ═══════════════════════════════════════════════════════════════════════════
  // USA — NEW BRANDS
  // ═══════════════════════════════════════════════════════════════════════════

  // Cava USA
  { id: 'us-cava-grilled-bowl', name: 'Grilled Chicken Bowl', brand: 'Cava', type: ['lunch', 'dinner'], calories: 570, protein: 48, carbs: 56, fat: 18, source: 'restaurant', tags: ['bowl', 'chicken', 'healthy'], country: 'USA' },
  { id: 'us-cava-falafel-bowl', name: 'Falafel Bowl', brand: 'Cava', type: ['lunch', 'dinner'], calories: 620, protein: 22, carbs: 70, fat: 28, source: 'restaurant', tags: ['bowl', 'vegetarian', 'vegan'], country: 'USA' },
  { id: 'us-cava-lamb-pita', name: 'Braised Lamb Pita', brand: 'Cava', type: ['lunch', 'dinner'], calories: 680, protein: 38, carbs: 62, fat: 28, source: 'restaurant', tags: ['sandwich', 'lamb'], country: 'USA' },
  { id: 'us-cava-salmon-bowl', name: 'Salmon Avocado Bowl', brand: 'Cava', type: ['lunch', 'dinner'], calories: 640, protein: 40, carbs: 52, fat: 28, source: 'restaurant', tags: ['bowl', 'fish', 'healthy'], country: 'USA' },

  // Five Guys USA
  { id: 'us-fg-little-burger', name: 'Little Hamburger', brand: 'Five Guys', type: ['lunch', 'dinner'], calories: 480, protein: 26, carbs: 40, fat: 22, source: 'restaurant', tags: ['burger', 'beef'], country: 'USA' },
  { id: 'us-fg-bacon-cheese', name: 'Bacon Cheeseburger', brand: 'Five Guys', type: ['lunch', 'dinner'], calories: 780, protein: 46, carbs: 40, fat: 48, source: 'restaurant', tags: ['burger', 'beef'], country: 'USA' },
  { id: 'us-fg-grilled-chicken', name: 'Grilled Chicken Sandwich', brand: 'Five Guys', type: ['lunch', 'dinner'], calories: 490, protein: 38, carbs: 40, fat: 16, source: 'restaurant', tags: ['sandwich', 'chicken', 'high-protein'], country: 'USA' },

  // 7-Eleven USA
  { id: 'us-7e-hotdog', name: 'Hot Dog (Standard)', brand: '7-Eleven', type: ['snack', 'lunch'], calories: 370, protein: 14, carbs: 30, fat: 22, source: 'restaurant', tags: ['snack'], country: 'USA' },
  { id: 'us-7e-taquito', name: 'Taquito Chicken', brand: '7-Eleven', type: ['snack'], calories: 200, protein: 9, carbs: 22, fat: 8, source: 'restaurant', tags: ['snack', 'chicken'], country: 'USA' },
  { id: 'us-7e-eggs', name: 'Hard-Boiled Eggs x2', brand: '7-Eleven', type: ['snack', 'lunch'], calories: 140, protein: 12, carbs: 1, fat: 10, source: 'restaurant', tags: ['snack', 'high-protein'], country: 'USA' },
  { id: 'us-7e-turkey-sandwich', name: 'Turkey & Cheese Sandwich', brand: '7-Eleven', type: ['snack', 'lunch'], calories: 420, protein: 22, carbs: 38, fat: 18, source: 'restaurant', tags: ['sandwich', 'turkey'], country: 'USA' },

];

// Automate dietary mapping for all items
const finalMeals = restaurantMeals.map(m => {
  if (!m.dietary) {
    m.dietary = [];
    if (m.tags?.includes('vegan')) m.dietary.push('vegan', 'vegetarian');
    else if (m.tags?.includes('vegetarian')) m.dietary.push('vegetarian');
    if (m.tags?.includes('keto')) m.dietary.push('keto');
    if (m.tags?.includes('gluten-free')) m.dietary.push('gluten-free');
    if (m.country === 'Lebanon') m.dietary.push('halal'); // Wide prevalence
  }
  return m;
});

module.exports = finalMeals;
