/**
 * Hardcoded nutritional data for French restaurant chains.
 * All values are per serving / per menu item as sold.
 * Sources: official restaurant websites, fankal.com, parlons-sport.fr, voical.app
 * source: "restaurant"
 */
const restaurantMeals = [

  // ═══════════════════════════════════════════════════════════════════════════
  // McDonald's France
  // ═══════════════════════════════════════════════════════════════════════════

  // Burgers
  { id: 'mcd-hamburger', name: 'Hamburger', brand: "McDonald's France", type: ['snack', 'lunch'], calories: 261, protein: 13, carbs: 32, fat: 9, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-cheeseburger', name: 'Cheeseburger', brand: "McDonald's France", type: ['snack', 'lunch'], calories: 303, protein: 16, carbs: 33, fat: 12, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-double-cheeseburger', name: 'Double Cheeseburger', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 440, protein: 29, carbs: 34, fat: 22, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-big-mac', name: 'Big Mac', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 508, protein: 27, carbs: 43, fat: 25, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-double-big-mac', name: 'Double Big Mac', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 680, protein: 42, carbs: 44, fat: 36, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-mcchicken', name: 'McChicken', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 439, protein: 21, carbs: 41, fat: 22, source: 'restaurant', tags: ['burger', 'chicken'] },
  { id: 'mcd-royal-cheese', name: 'Royal Cheese', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 518, protein: 29, carbs: 40, fat: 28, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-royal-deluxe', name: 'Royal Deluxe', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 543, protein: 31, carbs: 43, fat: 28, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-big-tasty', name: 'Big Tasty', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 719, protein: 38, carbs: 48, fat: 42, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'mcd-filet-o-fish', name: 'Filet-O-Fish', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 327, protein: 15, carbs: 35, fat: 14, source: 'restaurant', tags: ['burger', 'fish'] },

  // Wraps & Salads
  { id: 'mcd-mcwrap-poulet', name: 'McWrap Poulet Croustillant', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 498, protein: 31, carbs: 44, fat: 21, source: 'restaurant', tags: ['wrap', 'chicken'] },
  { id: 'mcd-mcwrap-poulet-grill', name: 'McWrap Poulet Grillé', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 390, protein: 28, carbs: 42, fat: 13, source: 'restaurant', tags: ['wrap', 'chicken', 'light'] },
  { id: 'mcd-salad-caesar', name: 'Salade Caesar Poulet', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 405, protein: 27, carbs: 20, fat: 24, source: 'restaurant', tags: ['salad', 'chicken'] },
  { id: 'mcd-salad-poulet-grill', name: 'Salade Poulet Grillé', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 210, protein: 26, carbs: 10, fat: 8, source: 'restaurant', tags: ['salad', 'chicken', 'light'] },

  // Chicken & Nuggets
  { id: 'mcd-chicken-nuggets-6', name: 'Chicken McNuggets x6', brand: "McDonald's France", type: ['snack'], calories: 279, protein: 17, carbs: 18, fat: 16, source: 'restaurant', tags: ['chicken', 'snack'] },
  { id: 'mcd-chicken-nuggets-9', name: 'Chicken McNuggets x9', brand: "McDonald's France", type: ['snack', 'lunch'], calories: 420, protein: 25, carbs: 27, fat: 24, source: 'restaurant', tags: ['chicken', 'snack'] },
  { id: 'mcd-chicken-nuggets-20', name: 'Chicken McNuggets x20', brand: "McDonald's France", type: ['lunch', 'dinner'], calories: 930, protein: 56, carbs: 60, fat: 53, source: 'restaurant', tags: ['chicken', 'sharing'] },
  { id: 'mcd-mcchicken-croquettes', name: 'Croquettes de Poulet x6', brand: "McDonald's France", type: ['snack'], calories: 250, protein: 14, carbs: 20, fat: 12, source: 'restaurant', tags: ['chicken', 'snack'] },

  // Breakfast
  { id: 'mcd-muffin-egg', name: 'Egg McMuffin', brand: "McDonald's France", type: ['snack'], calories: 285, protein: 17, carbs: 27, fat: 12, source: 'restaurant', tags: ['egg', 'snack', 'breakfast'] },
  { id: 'mcd-muffin-sausage', name: 'Muffin Saucisse', brand: "McDonald's France", type: ['snack'], calories: 380, protein: 16, carbs: 28, fat: 22, source: 'restaurant', tags: ['snack', 'breakfast'] },
  { id: 'mcd-egg-cheese-muffin', name: 'Egg & Cheese Muffin', brand: "McDonald's France", type: ['snack'], calories: 290, protein: 14, carbs: 29, fat: 13, source: 'restaurant', tags: ['egg', 'snack', 'breakfast'] },
  { id: 'mcd-pancakes', name: 'Pancakes x3 & Sirop', brand: "McDonald's France", type: ['snack'], calories: 430, protein: 9, carbs: 80, fat: 9, source: 'restaurant', tags: ['snack', 'breakfast', 'sweet'] },
  { id: 'mcd-porridge', name: 'Porridge Fruits Rouges', brand: "McDonald's France", type: ['snack'], calories: 290, protein: 7, carbs: 52, fat: 5, source: 'restaurant', tags: ['snack', 'breakfast', 'light'] },

  // Desserts / Snacks
  { id: 'mcd-mcflurry-oreo', name: 'McFlurry Oreo', brand: "McDonald's France", type: ['snack'], calories: 341, protein: 7, carbs: 54, fat: 11, source: 'restaurant', tags: ['snack', 'sweet', 'dessert'] },
  { id: 'mcd-sundae-chocolate', name: 'Sundae Chocolat', brand: "McDonald's France", type: ['snack'], calories: 285, protein: 5, carbs: 48, fat: 8, source: 'restaurant', tags: ['snack', 'sweet', 'dessert'] },
  { id: 'mcd-apple-pie', name: 'Chausson aux Pommes', brand: "McDonald's France", type: ['snack'], calories: 260, protein: 4, carbs: 37, fat: 11, source: 'restaurant', tags: ['snack', 'sweet', 'pastry'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // Burger King France
  // ═══════════════════════════════════════════════════════════════════════════

  // Burgers
  { id: 'bk-hamburger', name: 'Hamburger', brand: 'Burger King France', type: ['snack', 'lunch'], calories: 263, protein: 13, carbs: 28, fat: 11, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-cheeseburger', name: 'Cheeseburger', brand: 'Burger King France', type: ['snack', 'lunch'], calories: 313, protein: 16, carbs: 29, fat: 15, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-whopper-jr', name: 'Whopper Jr.', brand: 'Burger King France', type: ['snack', 'lunch'], calories: 310, protein: 17, carbs: 28, fat: 15, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-whopper', name: 'Whopper', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 629, protein: 28, carbs: 49, fat: 35, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-double-whopper', name: 'Double Whopper', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 870, protein: 50, carbs: 49, fat: 52, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-double-whopper-cheese', name: 'Double Whopper Cheese', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 960, protein: 55, carbs: 50, fat: 58, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-steakhouse', name: 'Steakhouse Burger', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 829, protein: 40, carbs: 56, fat: 50, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-cheddar-lover', name: 'Cheddar Lover Burger', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 640, protein: 30, carbs: 42, fat: 38, source: 'restaurant', tags: ['burger', 'beef'] },
  { id: 'bk-bkfc-sandwich', name: 'BKFC Sandwich', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 530, protein: 30, carbs: 42, fat: 27, source: 'restaurant', tags: ['burger', 'chicken'] },
  { id: 'bk-chicken-louisiane', name: 'Chicken Louisiane Steakhouse', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 846, protein: 42, carbs: 62, fat: 46, source: 'restaurant', tags: ['burger', 'chicken', 'spicy'] },
  { id: 'bk-plant-based', name: 'Plant-Based Burger', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 448, protein: 24, carbs: 41, fat: 21, source: 'restaurant', tags: ['vegan', 'burger'] },
  { id: 'bk-bbq-crispy', name: 'BBQ Crispy Chicken', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 510, protein: 28, carbs: 48, fat: 22, source: 'restaurant', tags: ['burger', 'chicken'] },

  // Wraps & Sides
  { id: 'bk-wrap-chicken-louisiane', name: 'Wrap Chicken Louisiane', brand: 'Burger King France', type: ['lunch', 'dinner'], calories: 726, protein: 36, carbs: 58, fat: 38, source: 'restaurant', tags: ['wrap', 'chicken', 'spicy'] },
  { id: 'bk-king-nuggets-6', name: 'King Nuggets x6', brand: 'Burger King France', type: ['snack'], calories: 300, protein: 18, carbs: 22, fat: 16, source: 'restaurant', tags: ['chicken', 'snack'] },
  { id: 'bk-king-nuggets-9', name: 'King Nuggets x9', brand: 'Burger King France', type: ['snack', 'lunch'], calories: 451, protein: 27, carbs: 33, fat: 24, source: 'restaurant', tags: ['chicken', 'snack'] },
  { id: 'bk-small-fries', name: 'Petites Frites', brand: 'Burger King France', type: ['snack'], calories: 239, protein: 3, carbs: 33, fat: 10, source: 'restaurant', tags: ['snack', 'sides'] },
  { id: 'bk-onion-rings', name: 'Onion Rings (portion)', brand: 'Burger King France', type: ['snack'], calories: 300, protein: 4, carbs: 38, fat: 14, source: 'restaurant', tags: ['snack', 'sides'] },
  { id: 'bk-sundae-vanilla', name: 'Sandy Vanilla Ice Cream', brand: 'Burger King France', type: ['snack'], calories: 182, protein: 4, carbs: 31, fat: 5, source: 'restaurant', tags: ['snack', 'sweet', 'dessert'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // Subway France (Sub 15cm, pain complet sauf mention)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'sub-boeuf', name: 'Sub Bœuf en Tranches 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 300, protein: 24, carbs: 38, fat: 6, source: 'restaurant', tags: ['sub', 'beef', 'light'] },
  { id: 'sub-poulet', name: 'Sub Poulet 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 304, protein: 24, carbs: 38, fat: 6, source: 'restaurant', tags: ['sub', 'chicken', 'light'] },
  { id: 'sub-poulet-teriyaki', name: 'Sub Poulet Teriyaki 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 323, protein: 24, carbs: 43, fat: 5, source: 'restaurant', tags: ['sub', 'chicken'] },
  { id: 'sub-chicken-tikka', name: 'Sub Chicken Tikka 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 302, protein: 24, carbs: 40, fat: 5, source: 'restaurant', tags: ['sub', 'chicken', 'light'] },
  { id: 'sub-jambon', name: 'Sub Jambon 15cm', brand: 'Subway France', type: ['lunch', 'snack'], calories: 273, protein: 17, carbs: 38, fat: 5, source: 'restaurant', tags: ['sub', 'ham', 'light'] },
  { id: 'sub-turkey', name: 'Sub Dinde 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 287, protein: 21, carbs: 38, fat: 5, source: 'restaurant', tags: ['sub', 'turkey', 'light'] },
  { id: 'sub-turkey-ham', name: 'Sub Dinde & Jambon 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 297, protein: 22, carbs: 38, fat: 5, source: 'restaurant', tags: ['sub', 'turkey', 'light'] },
  { id: 'sub-subway-club', name: 'Subway Club 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 306, protein: 25, carbs: 38, fat: 6, source: 'restaurant', tags: ['sub', 'chicken', 'light'] },
  { id: 'sub-tuna', name: 'Sub Thon 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 357, protein: 20, carbs: 38, fat: 12, source: 'restaurant', tags: ['sub', 'fish'] },
  { id: 'sub-veggie', name: 'Sub Végétarien 15cm', brand: 'Subway France', type: ['lunch', 'snack'], calories: 231, protein: 10, carbs: 41, fat: 3, source: 'restaurant', tags: ['sub', 'vegan', 'light'] },
  { id: 'sub-italian-bmt', name: 'Italian BMT 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 414, protein: 22, carbs: 38, fat: 19, source: 'restaurant', tags: ['sub', 'italian'] },
  { id: 'sub-meatball', name: 'Sub Boulettes 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 449, protein: 24, carbs: 47, fat: 18, source: 'restaurant', tags: ['sub', 'beef'] },
  { id: 'sub-spicy-italian', name: 'Spicy Italian 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 438, protein: 19, carbs: 38, fat: 24, source: 'restaurant', tags: ['sub', 'spicy'] },
  { id: 'sub-bbq-rib', name: 'Barbecue Rib 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 394, protein: 22, carbs: 48, fat: 13, source: 'restaurant', tags: ['sub', 'beef'] },
  { id: 'sub-poulet-bacon-ranch', name: 'Poulet Bacon Ranch 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 503, protein: 35, carbs: 38, fat: 25, source: 'restaurant', tags: ['sub', 'chicken', 'high-protein'] },
  { id: 'sub-chicken-fajita', name: 'Chicken Fajita 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 327, protein: 25, carbs: 41, fat: 8, source: 'restaurant', tags: ['sub', 'chicken', 'light'] },
  { id: 'sub-chicken-pizziola', name: 'Chicken Pizziola 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 439, protein: 30, carbs: 43, fat: 17, source: 'restaurant', tags: ['sub', 'chicken'] },
  { id: 'sub-subway-melt', name: 'Subway Melt 15cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 376, protein: 28, carbs: 38, fat: 14, source: 'restaurant', tags: ['sub', 'chicken', 'high-protein'] },
  { id: 'sub-steak-cheese', name: 'Steak & Cheese 30cm', brand: 'Subway France', type: ['lunch', 'dinner'], calories: 578, protein: 40, carbs: 60, fat: 18, source: 'restaurant', tags: ['sub', 'beef', 'high-protein'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // KFC France
  // ═══════════════════════════════════════════════════════════════════════════

  // Burgers & Sandwiches
  { id: 'kfc-krunchy', name: 'Krunchy Burger', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 334, protein: 17, carbs: 34, fat: 14, source: 'restaurant', tags: ['burger', 'chicken'] },
  { id: 'kfc-zinger', name: 'Zinger Burger', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 450, protein: 25, carbs: 43, fat: 20, source: 'restaurant', tags: ['burger', 'chicken', 'spicy'] },
  { id: 'kfc-boxmaster', name: 'Boxmaster', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 657, protein: 36, carbs: 56, fat: 33, source: 'restaurant', tags: ['burger', 'chicken'] },
  { id: 'kfc-twister', name: 'Twister Poulet', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 498, protein: 26, carbs: 50, fat: 21, source: 'restaurant', tags: ['wrap', 'chicken'] },
  { id: 'kfc-tower-burger', name: 'Tower Burger', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 570, protein: 29, carbs: 47, fat: 28, source: 'restaurant', tags: ['burger', 'chicken'] },

  // Chicken Pieces & Buckets
  { id: 'kfc-tenders-3', name: 'Tenders x3', brand: 'KFC France', type: ['snack', 'lunch'], calories: 278, protein: 22, carbs: 19, fat: 13, source: 'restaurant', tags: ['chicken', 'snack'] },
  { id: 'kfc-tenders-5', name: 'Tenders x5', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 464, protein: 37, carbs: 32, fat: 21, source: 'restaurant', tags: ['chicken', 'high-protein'] },
  { id: 'kfc-bucket-3', name: 'Bucket 3 Pièces', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 570, protein: 38, carbs: 24, fat: 35, source: 'restaurant', tags: ['chicken', 'fried'] },
  { id: 'kfc-bucket-5', name: 'Bucket 5 Pièces', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 950, protein: 63, carbs: 40, fat: 58, source: 'restaurant', tags: ['chicken', 'fried', 'sharing'] },
  { id: 'kfc-spicy-wings', name: 'Ailes Épicées (par unité)', brand: 'KFC France', type: ['snack'], calories: 95, protein: 6, carbs: 4, fat: 6, source: 'restaurant', tags: ['chicken', 'snack', 'spicy'] },
  { id: 'kfc-hot-wings-5', name: 'Hot Wings x5', brand: 'KFC France', type: ['snack', 'lunch'], calories: 475, protein: 30, carbs: 20, fat: 30, source: 'restaurant', tags: ['chicken', 'snack', 'spicy'] },
  { id: 'kfc-popcorn-chicken', name: 'Popcorn Chicken (medium)', brand: 'KFC France', type: ['snack'], calories: 310, protein: 21, carbs: 22, fat: 16, source: 'restaurant', tags: ['chicken', 'snack'] },

  // Salads & Light
  { id: 'kfc-salad-chicken', name: 'Salade Poulet Grillé', brand: 'KFC France', type: ['lunch', 'dinner'], calories: 260, protein: 30, carbs: 8, fat: 12, source: 'restaurant', tags: ['salad', 'chicken', 'light'] },
  { id: 'kfc-mini-fillet', name: 'Mini Filet Burger', brand: 'KFC France', type: ['snack'], calories: 280, protein: 16, carbs: 28, fat: 11, source: 'restaurant', tags: ['burger', 'chicken', 'snack'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // Prêt à Manger France
  // ═══════════════════════════════════════════════════════════════════════════

  // Sandwiches & Baguettes
  { id: 'pret-chicken-avocado', name: 'Sandwich Poulet Avocat', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 430, protein: 28, carbs: 36, fat: 18, source: 'restaurant', tags: ['sandwich', 'chicken', 'healthy'] },
  { id: 'pret-tuna-baguette', name: 'Baguette Thon Mayo', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 460, protein: 24, carbs: 48, fat: 17, source: 'restaurant', tags: ['baguette', 'fish'] },
  { id: 'pret-ham-cheese-baguette', name: 'Baguette Jambon Emmental', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 445, protein: 26, carbs: 48, fat: 15, source: 'restaurant', tags: ['baguette', 'ham'] },
  { id: 'pret-egg-cress', name: 'Sandwich Œuf Mayo Cresson', brand: 'Prêt à Manger', type: ['lunch', 'snack'], calories: 390, protein: 18, carbs: 38, fat: 17, source: 'restaurant', tags: ['sandwich', 'egg'] },
  { id: 'pret-super-club-baguette', name: 'Super Club Baguette', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 500, protein: 32, carbs: 50, fat: 19, source: 'restaurant', tags: ['baguette', 'chicken'] },
  { id: 'pret-chicken-caesar-baguette', name: 'Baguette Caesar Poulet & Bacon', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 520, protein: 34, carbs: 46, fat: 22, source: 'restaurant', tags: ['baguette', 'chicken', 'bacon'] },
  { id: 'pret-prosciutto-baguette', name: 'Baguette Prosciutto Crudo', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 470, protein: 26, carbs: 50, fat: 18, source: 'restaurant', tags: ['baguette', 'ham'] },
  { id: 'pret-mozza-toastie', name: 'Toastie Mozza & Truffe Cheddar', brand: 'Prêt à Manger', type: ['lunch', 'snack'], calories: 480, protein: 22, carbs: 44, fat: 24, source: 'restaurant', tags: ['toastie', 'vegetarian'] },
  { id: 'pret-ham-cheese-toastie', name: 'Toastie Jambon Fromage Moutarde', brand: 'Prêt à Manger', type: ['lunch', 'snack'], calories: 440, protein: 24, carbs: 42, fat: 20, source: 'restaurant', tags: ['toastie', 'ham'] },
  { id: 'pret-cheddar-pickle', name: 'Sandwich Posh Cheddar & Pickle', brand: 'Prêt à Manger', type: ['lunch', 'snack'], calories: 410, protein: 16, carbs: 44, fat: 18, source: 'restaurant', tags: ['sandwich', 'vegetarian'] },

  // Wraps
  { id: 'pret-vegan-wrap', name: 'Wrap Végétalien Falafel & Houmous', brand: 'Prêt à Manger', type: ['lunch', 'snack'], calories: 380, protein: 13, carbs: 52, fat: 14, source: 'restaurant', tags: ['wrap', 'vegan'] },
  { id: 'pret-avocado-pine-wrap', name: 'Wrap Avocat & Pignons de Pin', brand: 'Prêt à Manger', type: ['lunch', 'snack'], calories: 420, protein: 12, carbs: 46, fat: 21, source: 'restaurant', tags: ['wrap', 'vegan'] },

  // Salads & Bowls
  { id: 'pret-chicken-caesar-salad', name: 'Salade Caesar Poulet', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 360, protein: 30, carbs: 14, fat: 20, source: 'restaurant', tags: ['salad', 'chicken', 'light'] },
  { id: 'pret-salmon-pasta', name: 'Salade Pâtes Saumon Fumé', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 470, protein: 22, carbs: 54, fat: 16, source: 'restaurant', tags: ['pasta', 'fish', 'salad'] },
  { id: 'pret-protein-bowl', name: 'Bowl Protéiné Poulet & Quinoa', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 490, protein: 38, carbs: 42, fat: 14, source: 'restaurant', tags: ['bowl', 'chicken', 'high-protein', 'quinoa'] },
  { id: 'pret-salmon-bowl', name: 'Bowl Saumon Riz Noir & Gingembre', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 510, protein: 32, carbs: 50, fat: 20, source: 'restaurant', tags: ['bowl', 'fish', 'healthy'] },
  { id: 'pret-falafel-bowl', name: 'Bowl Falafel Mezze & Quinoa', brand: 'Prêt à Manger', type: ['lunch', 'dinner'], calories: 440, protein: 16, carbs: 58, fat: 17, source: 'restaurant', tags: ['bowl', 'vegan'] },

  // Soups
  { id: 'pret-tomato-soup', name: 'Soupe Tomate & Basilic', brand: 'Prêt à Manger', type: ['lunch', 'dinner', 'snack'], calories: 190, protein: 5, carbs: 28, fat: 7, source: 'restaurant', tags: ['soup', 'vegan', 'light'] },
  { id: 'pret-chicken-soup', name: 'Soupe Poulet & Légumes', brand: 'Prêt à Manger', type: ['lunch', 'dinner', 'snack'], calories: 215, protein: 18, carbs: 20, fat: 6, source: 'restaurant', tags: ['soup', 'chicken', 'light'] },
  { id: 'pret-lentil-soup', name: 'Soupe Lentilles & Épices', brand: 'Prêt à Manger', type: ['lunch', 'dinner', 'snack'], calories: 200, protein: 10, carbs: 30, fat: 5, source: 'restaurant', tags: ['soup', 'vegan', 'light'] },

  // Snacks & Desserts
  { id: 'pret-yogurt-granola', name: 'Yaourt Granola & Fruits Rouges', brand: 'Prêt à Manger', type: ['snack'], calories: 245, protein: 10, carbs: 38, fat: 6, source: 'restaurant', tags: ['snack', 'yogurt', 'light'] },
  { id: 'pret-almond-croissant', name: 'Croissant aux Amandes', brand: 'Prêt à Manger', type: ['snack'], calories: 430, protein: 9, carbs: 44, fat: 25, source: 'restaurant', tags: ['snack', 'pastry', 'sweet'] },
  { id: 'pret-blueberry-muffin', name: 'Muffin Myrtilles', brand: 'Prêt à Manger', type: ['snack'], calories: 390, protein: 6, carbs: 58, fat: 15, source: 'restaurant', tags: ['snack', 'sweet', 'pastry'] },
  { id: 'pret-choc-hazel-muffin', name: 'Muffin Chocolat Noisette', brand: 'Prêt à Manger', type: ['snack'], calories: 420, protein: 7, carbs: 55, fat: 19, source: 'restaurant', tags: ['snack', 'sweet', 'pastry'] },
  { id: 'pret-dark-chocolate-pot', name: 'Pot de Chocolat Noir', brand: 'Prêt à Manger', type: ['snack'], calories: 310, protein: 6, carbs: 36, fat: 16, source: 'restaurant', tags: ['snack', 'sweet', 'chocolate'] },
  { id: 'pret-carrot-cake', name: 'Carrot Cake', brand: 'Prêt à Manger', type: ['snack'], calories: 380, protein: 5, carbs: 52, fat: 17, source: 'restaurant', tags: ['snack', 'sweet', 'cake'] },
  { id: 'pret-dark-choc-cookie', name: 'Cookie Chocolat Noir', brand: 'Prêt à Manger', type: ['snack'], calories: 260, protein: 4, carbs: 34, fat: 13, source: 'restaurant', tags: ['snack', 'sweet', 'cookie'] },
  { id: 'pret-brownie', name: 'Brownie Chocolat', brand: 'Prêt à Manger', type: ['snack'], calories: 340, protein: 5, carbs: 42, fat: 18, source: 'restaurant', tags: ['snack', 'sweet', 'chocolate'] },
  { id: 'pret-fresh-fruit-pot', name: 'Pot de Fruits Frais', brand: 'Prêt à Manger', type: ['snack'], calories: 90, protein: 1, carbs: 20, fat: 0, source: 'restaurant', tags: ['snack', 'fruit', 'light'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRANCE — BOULANGERIES (Paul, Brioche Dorée, etc.)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'paul-panini-steak', name: 'Panini Steak (Bœuf, Fromage)', brand: 'Boulangerie Paul', type: ['lunch', 'dinner'], calories: 540, protein: 28, carbs: 58, fat: 22, source: 'restaurant', tags: ['sandwich', 'beef'], country: 'France' },
  { id: 'paul-pavot-poulet', name: 'Sandwich Pavot Poulet', brand: 'Boulangerie Paul', type: ['lunch', 'snack'], calories: 480, protein: 24, carbs: 52, fat: 18, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'France' },
  { id: 'bd-croque-monsieur', name: 'Croque Monsieur', brand: 'Brioche Dorée', type: ['lunch', 'snack'], calories: 410, protein: 18, carbs: 32, fat: 24, source: 'restaurant', tags: ['sandwich', 'ham'], country: 'France' },
  { id: 'mk-baguette-jambon', name: 'Baguette Jambon Beurre', brand: 'Maison Kayser', type: ['lunch', 'snack'], calories: 512, protein: 21, carbs: 64, fat: 19, source: 'restaurant', tags: ['sandwich', 'ham'], country: 'France' },

  // ═══════════════════════════════════════════════════════════════════════════
  // USA — RESTAURANTS & FAST FOOD
  // ═══════════════════════════════════════════════════════════════════════════

  // Chipotle
  { id: 'us-chip-chicken-bowl', name: 'Chicken Burrito Bowl (Rice, Black Beans, Salsa)', brand: 'Chipotle', type: ['lunch', 'dinner'], calories: 660, protein: 52, carbs: 70, fat: 18, source: 'restaurant', tags: ['bowl', 'chicken', 'healthy'], country: 'USA' },
  { id: 'us-chip-steak-tacos', name: 'Steak Tacos (3 pcs, Corn)', brand: 'Chipotle', type: ['lunch', 'dinner'], calories: 540, protein: 36, carbs: 45, fat: 24, source: 'restaurant', tags: ['tacos', 'beef'], country: 'USA' },
  
  // Sweetgreen
  { id: 'us-sg-harvest-bowl', name: 'Harvest Bowl', brand: 'Sweetgreen', type: ['lunch', 'dinner'], calories: 705, protein: 36, carbs: 68, fat: 34, source: 'restaurant', tags: ['salad', 'bowl', 'chicken', 'healthy'], country: 'USA' },
  { id: 'us-sg-kale-caesar', name: 'Kale Caesar (with Chicken)', brand: 'Sweetgreen', type: ['lunch', 'dinner'], calories: 420, protein: 31, carbs: 14, fat: 28, source: 'restaurant', tags: ['salad', 'chicken', 'healthy'], country: 'USA' },

  // Cava
  { id: 'us-cava-chicken-bowl', name: 'Greens & Grains Bowl (Chicken)', brand: 'Cava', type: ['lunch', 'dinner'], calories: 580, protein: 42, carbs: 55, fat: 22, source: 'restaurant', tags: ['bowl', 'chicken', 'mediterranean', 'healthy'], country: 'USA' },

  // McDonald's USA
  { id: 'us-mcd-quarter-pounder', name: 'Quarter Pounder with Cheese', brand: "McDonald's USA", type: ['lunch', 'dinner'], calories: 520, protein: 30, carbs: 42, fat: 26, source: 'restaurant', tags: ['burger', 'beef'], country: 'USA' },
  { id: 'us-mcd-mcnuggets-10', name: 'Chicken McNuggets x10', brand: "McDonald's USA", type: ['snack', 'lunch'], calories: 410, protein: 23, carbs: 25, fat: 24, source: 'restaurant', tags: ['chicken', 'snack'], country: 'USA' },

  // Chick-fil-A
  { id: 'us-cfa-sandwich', name: 'Chicken Sandwich', brand: 'Chick-fil-A', type: ['lunch', 'dinner'], calories: 440, protein: 28, carbs: 41, fat: 19, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'USA' },
  { id: 'us-cfa-grilled-nuggets', name: 'Grilled Nuggets x8', brand: 'Chick-fil-A', type: ['snack', 'lunch'], calories: 130, protein: 25, carbs: 1, fat: 3, source: 'restaurant', tags: ['chicken', 'healthy', 'low-carb'], country: 'USA' },

  // Starbucks USA
  { id: 'us-sbux-egg-bites', name: 'Egg White & Roasted Red Pepper Sous Vide', brand: 'Starbucks', type: ['snack'], calories: 170, protein: 12, carbs: 11, fat: 8, source: 'restaurant', tags: ['egg', 'breakfast', 'healthy'], country: 'USA' },
  { id: 'us-sbux-turkey-pesto', name: 'Turkey, Provolone & Pesto Panini', brand: 'Starbucks', type: ['lunch', 'snack'], calories: 520, protein: 34, carbs: 54, fat: 19, source: 'restaurant', tags: ['sandwich', 'turkey'], country: 'USA' },

  // Panda Express
  { id: 'us-panda-orange-chicken', name: 'Orange Chicken (Serving)', brand: 'Panda Express', type: ['lunch', 'dinner'], calories: 490, protein: 25, carbs: 51, fat: 23, source: 'restaurant', tags: ['asian', 'chicken'], country: 'USA' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN — RESTAURANTS & TAPAS
  // ═══════════════════════════════════════════════════════════════════════════

  // VIPS
  { id: 'es-vips-club', name: 'VIPS Club Sandwich', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 920, protein: 42, carbs: 68, fat: 54, source: 'restaurant', tags: ['sandwich', 'chicken'], country: 'Spain' },
  { id: 'es-vips-burger', name: 'Burger Pampera', brand: 'VIPS', type: ['lunch', 'dinner'], calories: 850, protein: 40, carbs: 52, fat: 55, source: 'restaurant', tags: ['burger', 'beef'], country: 'Spain' },

  // 100 Montaditos
  { id: 'es-100m-chicken', name: 'Montadito Pollo Kebab', brand: '100 Montaditos', type: ['snack', 'lunch'], calories: 240, protein: 12, carbs: 28, fat: 9, source: 'restaurant', tags: ['tapas', 'chicken'], country: 'Spain' },
  { id: 'es-100m-lomo', name: 'Montadito Lomo con Queso', brand: '100 Montaditos', type: ['snack', 'lunch'], calories: 260, protein: 14, carbs: 28, fat: 11, source: 'restaurant', tags: ['tapas', 'pork'], country: 'Spain' },

  // Goiko
  { id: 'es-goiko-kevin', name: 'Kevin Bacon Burger', brand: 'Goiko', type: ['lunch', 'dinner'], calories: 1100, protein: 55, carbs: 45, fat: 75, source: 'restaurant', tags: ['burger', 'beef'], country: 'Spain' },

  // 7-Eleven USA
  { id: 'us-711-hotdog', name: 'Big Bite Hot Dog (no bun)', brand: '7-Eleven', type: ['snack', 'lunch'], calories: 290, protein: 12, carbs: 4, fat: 26, source: 'restaurant', tags: ['beef', 'snack'], country: 'USA' },
  { id: 'us-711-taquito', name: 'Steak & Cheese Taquito', brand: '7-Eleven', type: ['snack'], calories: 240, protein: 7, carbs: 24, fat: 12, source: 'restaurant', tags: ['snack'], country: 'USA' },

  // Dunkin' USA
  { id: 'us-dunkin-egg', name: 'Egg & Cheese Wake-Up Wrap', brand: "Dunkin'", type: ['snack'], calories: 180, protein: 9, carbs: 15, fat: 9, source: 'restaurant', tags: ['egg', 'breakfast'], country: 'USA' },
  { id: 'us-dunkin-bacon', name: 'Bacon, Egg & Cheese Croissant', brand: "Dunkin'", type: ['lunch', 'snack'], calories: 540, protein: 18, carbs: 37, fat: 35, source: 'restaurant', tags: ['sandwich', 'breakfast'], country: 'USA' },

  // 100 Montaditos (Additional)
  { id: 'es-100m-hotdog', name: 'Mini Perrito con Cebolla', brand: '100 Montaditos', type: ['snack'], calories: 210, protein: 8, carbs: 22, fat: 10, source: 'restaurant', tags: ['tapas'], country: 'Spain' },

  // Granier Spain
  { id: 'es-granier-flauta', name: 'Flauta de Jamón Serrano', brand: 'Granier', type: ['lunch', 'snack'], calories: 380, protein: 16, carbs: 48, fat: 14, source: 'restaurant', tags: ['sandwich', 'ham'], country: 'Spain' },

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL DESSERTS & SWEETS
  // ═══════════════════════════════════════════════════════════════════════════

  // Lebanon
  { id: 'leb-pinkberry-orig', name: 'Original Frozen Yogurt (Small)', brand: 'Pinkberry Lebanon', type: ['dessert', 'snack'], calories: 140, protein: 3, carbs: 29, fat: 0, source: 'restaurant', tags: ['dessert', 'frozen-yogurt'], country: 'Lebanon' },
  { id: 'leb-dipndip-crepe', name: 'Fettuccine Crepe (Half)', brand: 'Dip n Dip', type: ['dessert'], calories: 450, protein: 6, carbs: 55, fat: 24, source: 'restaurant', tags: ['dessert', 'chocolate'], country: 'Lebanon' },

  // USA
  { id: 'us-dq-blizzard', name: 'Oreo Blizzard (Mini)', brand: 'Dairy Queen', type: ['dessert'], calories: 420, protein: 8, carbs: 62, fat: 16, source: 'restaurant', tags: ['dessert', 'ice-cream'], country: 'USA' },
  { id: 'us-br-scoop', name: 'Jamoca Almond Fudge (1 scoop)', brand: 'Baskin Robbins', type: ['dessert', 'snack'], calories: 240, protein: 4, carbs: 28, fat: 13, source: 'restaurant', tags: ['dessert', 'ice-cream'], country: 'USA' },
  { id: 'us-crumbl-choc', name: 'Milk Chocolate Chip Cookie (1/4 cookie)', brand: 'Crumbl Cookies', type: ['snack', 'dessert'], calories: 180, protein: 2, carbs: 24, fat: 9, source: 'restaurant', tags: ['dessert', 'cookie'], country: 'USA' },

  // Spain
  { id: 'es-llao-small', name: 'Llaollao Small with 1 topping', brand: 'Llaollao', type: ['dessert', 'snack'], calories: 210, protein: 5, carbs: 36, fat: 4, source: 'restaurant', tags: ['dessert', 'frozen-yogurt'], country: 'Spain' },
  { id: 'es-valor-churros', name: 'Churros con Chocolate (2 pcs)', brand: 'Chocolatería Valor', type: ['dessert', 'snack'], calories: 380, protein: 4, carbs: 48, fat: 18, source: 'restaurant', tags: ['dessert', 'churros'], country: 'Spain' },

  // France
  { id: 'fr-laduree-macaron', name: 'Macarons (Assortment x3)', brand: 'Ladurée', type: ['dessert', 'snack'], calories: 270, protein: 4, carbs: 32, fat: 14, source: 'restaurant', tags: ['dessert', 'pastry'], country: 'France' },
  { id: 'fr-amorino-gelato', name: 'Gelato Small Flower', brand: 'Amorino', type: ['dessert', 'snack'], calories: 220, protein: 3, carbs: 34, fat: 8, source: 'restaurant', tags: ['dessert', 'ice-cream'], country: 'France' }

];

// Automate country and dietary mapping for existing items
const finalMeals = restaurantMeals.map(m => {
  if (!m.country) m.country = 'France';
  if (!m.dietary) {
    m.dietary = [];
    if (m.tags?.includes('vegan')) m.dietary.push('vegan', 'vegetarian');
    if (m.tags?.includes('vegetarian')) m.dietary.push('vegetarian');
    if (m.tags?.includes('keto')) m.dietary.push('keto');
    if (m.tags?.includes('gluten-free')) m.dietary.push('gluten-free');
    // For France, we won't blindly assume halal. 
  }
  return m;
});

module.exports = finalMeals;
