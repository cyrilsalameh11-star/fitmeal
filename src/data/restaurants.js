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
