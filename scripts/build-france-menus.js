// Replace all France brand entries (except Pan Asie) with menu-derived data.
// Run: node scripts/build-france-menus.js
//
// Item tuples: [name, category, kcal, protein_g, carbs_g, fat_g, [tags]]

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'france_restaurants.js');
const existing = require(DATA_PATH);

const slug = s => s.toLowerCase()
  .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i')
  .replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u').replace(/[ç]/g, 'c').replace(/['']/g, '')
  .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50);

const typeFromCat = (c) => {
  if (c === 'breakfast') return ['breakfast'];
  if (c === 'drink') return ['drink', 'snack'];
  if (c === 'dessert' || c === 'crepe' || c === 'pancake' || c === 'waffle' || c === 'ice cream' || c === 'tart') return ['dessert', 'snack'];
  if (c === 'starter' || c === 'side' || c === 'salad') return ['snack', 'lunch'];
  return ['lunch', 'dinner'];
};

function makeEntries(brand, prefix, rows) {
  return rows.map(r => {
    const [name, cat, cal, p, c, f, tags = []] = r;
    return {
      id: `fr-${prefix}-${slug(name)}`,
      name,
      brand,
      type: typeFromCat(cat),
      calories: Math.round(cal),
      protein: Math.round(p),
      carbs:   Math.round(c),
      fat:     Math.round(f),
      tags: tags.slice(0, 4),
      country: 'France',
      source: 'restaurant',
      shoppingItems: [`${name} — ${brand}`],
    };
  });
}

// ============================== McDonald's France ==============================
// Source: McDonald's France 2025 official nutrition brochure (mcdofrance-menu.pdf).
const MCDO = [
  // Burgers
  ['Big Mac',                              'burger',   530, 27, 42, 27, ['beef','cheese']],
  ['Big Mac Bacon',                        'burger',   551, 29, 42, 29, ['beef','cheese']],
  ['Big Tasty 1 Steak Haché',              'burger',   690, 37, 44, 40, ['beef','cheese']],
  ['Big Tasty 2 Steaks Hachés',            'burger',   940, 59, 44, 58, ['beef','cheese']],
  ['280 Original',                         'burger',   772, 44, 55, 41, ['beef','cheese']],
  ['McVeggie',                             'burger',   409, 17, 46, 16, ['vegetarian']],
  ['McExtreme 1 Steak Haché',              'burger',   853, 45, 41, 56, ['beef','cheese']],
  ['McExtreme 2 Steaks Hachés',            'burger',  1186, 72, 41, 81, ['beef','cheese']],
  ['Big Arch',                             'burger',  1076, 59, 55, 68, ['beef','cheese']],
  ['Royal Deluxe',                         'burger',   545, 29, 36, 32, ['beef','cheese']],
  ['Royal Bacon',                          'burger',   492, 30, 38, 24, ['beef','cheese']],
  ['Royal Cheese',                         'burger',   525, 31, 39, 27, ['beef','cheese']],
  ['Hamburger',                            'burger',   253, 13, 29, 9,  ['beef']],
  ['Cheeseburger',                         'burger',   300, 16, 30, 13, ['beef','cheese']],
  ['Double Cheese',                        'burger',   442, 27, 31, 23, ['beef','cheese']],
  ['Double Cheese Bacon',                  'burger',   456, 28, 31, 24, ['beef','cheese']],
  // Sandwiches
  ['CBO (Chicken Bacon Oignons)',          'sandwich', 659, 27, 57, 35, ['chicken','cheese']],
  ['McChicken',                            'sandwich', 434, 19, 45, 19, ['chicken']],
  ['McCrispy',                             'sandwich', 530, 27, 54, 22, ['chicken']],
  ['Filet-O-Fish',                         'sandwich', 329, 15, 36, 14, ['fish','cheese']],
  ['Double Filet-O-Fish',                  'sandwich', 474, 24, 44, 22, ['fish','cheese']],
  ['Filet-O-Fish Deluxe',                  'sandwich', 361, 16, 37, 16, ['fish','cheese']],
  ['Croque McDo',                          'sandwich', 255, 13, 28, 10, ['cheese']],
  ["P'tit Chicken",                        'sandwich', 311, 12, 35, 13, ['chicken']],
  ['McFish',                               'sandwich', 283, 14, 38, 8,  ['fish']],
  ['McFish Mayo',                          'sandwich', 295, 13, 35, 11, ['fish']],
  // Wraps
  ['McWrap New York Poulet & Bacon',       'wrap',     552, 22, 56, 26, ['chicken','cheese']],
  ['McWrap Veggie',                        'wrap',     495, 20, 51, 22, ['vegetarian','cheese']],
  ["P'tit Wrap Ranch",                     'wrap',     319, 11, 32, 16, ['chicken']],
  // Breakfast / McMuffin
  ['Egg & Cheese McMuffin',                'breakfast',263, 16, 27, 10, ['breakfast','cheese']],
  ['Egg & Bacon McMuffin',                 'breakfast',277, 17, 27, 11, ['breakfast','cheese']],
  ['Croissant',                            'breakfast',204, 4,  24, 10, ['breakfast']],
  ['Pain au Chocolat',                     'breakfast',277, 5,  32, 14, ['breakfast']],
  // Nuggets / fried
  ['Chicken McNuggets 4 pcs',              'fried',    174, 10, 13, 9,  ['chicken']],
  ['Chicken McNuggets 6 pcs',              'fried',    262, 15, 19, 13, ['chicken']],
  ['Chicken McNuggets 9 pcs',              'fried',    392, 23, 29, 20, ['chicken']],
  ['Chicken McNuggets 20 pcs',             'fried',    872, 51, 65, 45, ['chicken']],
  ['Veggie McPlant Nuggets 4 pcs',         'fried',    189, 9,  14, 10, ['vegetarian']],
  ['Veggie McPlant Nuggets 6 pcs',         'fried',    284, 13, 21, 16, ['vegetarian']],
  ['Veggie McPlant Nuggets 9 pcs',         'fried',    426, 20, 31, 23, ['vegetarian']],
  // Salades
  ['Salade Caesar Poulet',                 'salad',    402, 25, 27, 21, ['chicken','cheese','salad']],
  ['Salade Caesar Veggie',                 'salad',    390, 15, 35, 20, ['vegetarian','cheese','salad']],
  // Sides
  ['Frite Petite Portion',                 'side',     231, 3,  29, 11, []],
  ['Frite Moyenne Portion',                'side',     328, 4,  41, 16, []],
  ['Frite Grande Portion',                 'side',     434, 5,  54, 21, []],
  ['Deluxe Potatoes Moyenne',              'side',     227, 3,  26, 12, []],
  ['Deluxe Potatoes Grande',               'side',     330, 4,  37, 17, []],
  ['Potatoes Cheddar Fondu Bacon',         'side',     467, 11, 49, 24, ['cheese']],
  ['Potatoes Double Cheddar Fondu',        'side',     467, 11, 49, 24, ['cheese']],
  ['McFlavor Fries Cheddar Fondu Bacon',   'side',     570, 12, 60, 30, ['cheese']],
  ['McFlavor Fries Double Cheddar Fondu',  'side',     570, 12, 60, 30, ['cheese']],
  // Desserts
  ['Sundae Nature',                        'dessert',  191, 6,  25, 7,  ['dessert']],
  ['Sundae Nappage Caramel',               'dessert',  326, 6,  54, 9,  ['dessert']],
  ['Sundae Nappage Chocolat',              'dessert',  324, 7,  46, 12, ['dessert']],
  ['McFlurry Daim',                        'dessert',  327, 6,  47, 11, ['dessert']],
  ["McFlurry M&M's",                       'dessert',  322, 8,  47, 11, ['dessert']],
  ['McFlurry Kit-Kat Ball',                'dessert',  283, 7,  44, 9,  ['dessert']],
  ['McFlurry Nature',                      'dessert',  199, 5,  33, 5,  ['dessert']],
  ['Donut Nature',                         'dessert',  286, 4,  29, 17, ['dessert']],
  ['Donut Saveur Chocolat',                'dessert',  363, 4,  32, 24, ['dessert']],
  ['Cookie Fourré Choconuts',              'dessert',  380, 5,  50, 18, ['dessert']],
  ['Cookie Chocolat au Lait Noisette',     'dessert',  360, 5,  42, 19, ['dessert']],
  ['Cookie Caramel Noix de Pécan',         'dessert',  350, 5,  47, 15, ['dessert']],
  ['Cookie Fourré Framboise',              'dessert',  294, 4,  47, 10, ['dessert']],
  ['Cinnamon Roll',                        'dessert',  344, 5,  45, 15, ['dessert']],
  ['Muffin Chocolat Noisette',             'dessert',  595, 8,  64, 33, ['dessert']],
  ['Muffin aux Myrtilles',                 'dessert',  480, 6,  63, 22, ['dessert']],
  ['Muffin Cœur Caramel',                  'dessert',  551, 6,  74, 25, ['dessert']],
  ["Cheesecake Choconut M&M's",            'dessert',  494, 9,  52, 28, ['dessert']],
  // Drinks
  ["P'tit Milkshake Vanille",              'drink',    257, 6,  46, 6,  ['dessert']],
  ["P'tit Milkshake Fraise",               'drink',    254, 6,  45, 6,  ['dessert']],
  ['Grand Milkshake Vanille',              'drink',    315, 9,  56, 6,  ['dessert']],
  ['Grand Milkshake Fraise',               'drink',    315, 9,  56, 6,  ['dessert']],
  ['Délifrapp Vanille',                    'drink',    265, 5,  27, 15, ['dessert']],
  ['Délifrapp Cookie',                     'drink',    613, 9,  68, 34, ['dessert']],
  ['Café Latte Glacé Gourmand',            'drink',    151, 5,  10, 10, []],
  ['Smoothie Banane Fraise',               'drink',    299, 2,  63, 1,  []],
  ['Smoothie Mangue Papaye Passion',       'drink',    298, 2,  62, 1,  []],
  ['Cappuccino',                           'drink',    79,  5,  9,  3,  []],
  ['Café Latte',                           'drink',    58,  4,  6,  2,  []],
  ['Chocolat Chaud',                       'drink',    160, 8,  22, 4,  []],
  ['Mocha Viennois',                       'drink',    172, 6,  20, 8,  []],
  ['Chocolat Viennois',                    'drink',    197, 8,  23, 8,  []],
];

// ============================== Burger King France ==============================
const BK = [
  // Whopper line
  ['Whopper',                      'burger',  617, 28, 50, 35, ['beef','burger']],
  ['Cheese Whopper',               'burger',  697, 33, 51, 41, ['beef','cheese','burger']],
  ['Double Whopper',               'burger',  882, 49, 50, 56, ['beef','cheese','burger']],
  ['Bacon Cheese Whopper',         'burger',  730, 36, 51, 43, ['beef','cheese','burger']],
  ['Whopper Junior',               'burger',  315, 14, 28, 17, ['beef','burger']],
  ['Steakhouse',                   'burger',  812, 44, 56, 45, ['beef','cheese','burger']],
  ['Big King',                     'burger',  570, 30, 42, 30, ['beef','burger']],
  ['Big King XXL',                 'burger',  865, 50, 47, 53, ['beef','cheese','burger']],
  ['Master Bacon Lover',           'burger',  794, 39, 56, 44, ['beef','cheese','burger']],
  ['Master Cheese Lover',          'burger',  740, 36, 56, 41, ['beef','cheese','burger']],
  ['Hamburger',                    'burger',  280, 14, 28, 11, ['beef','burger']],
  ['Cheeseburger',                 'burger',  330, 17, 28, 15, ['beef','cheese','burger']],
  ['Double Cheeseburger',          'burger',  475, 28, 28, 26, ['beef','cheese','burger']],
  ['Bacon Cheeseburger',           'burger',  370, 20, 28, 18, ['beef','cheese','burger']],
  ['Long Bacon',                   'burger',  535, 27, 53, 23, ['beef','cheese','burger']],
  ['Steakhouse Junior',            'burger',  445, 22, 35, 25, ['beef','cheese','burger']],
  // Chicken
  ['Long Chicken',                 'burger',  525, 21, 60, 22, ['chicken','burger']],
  ['Big Long Chicken',             'burger',  705, 32, 70, 32, ['chicken','cheese','burger']],
  ['Chicken Cheese',               'burger',  390, 19, 38, 17, ['chicken','cheese','burger']],
  ['Crousty Chicken',              'burger',  365, 17, 38, 16, ['chicken','burger']],
  ['Crousty Chèvre',               'burger',  555, 20, 50, 30, ['chicken','cheese','burger']],
  ['Crousty Bacon',                'burger',  530, 25, 41, 30, ['chicken','cheese','burger']],
  ['Tenders Crispy x4',            'fried',   215, 16, 14, 11, ['chicken']],
  ['Tenders Crispy x6',            'fried',   325, 24, 21, 16, ['chicken']],
  ['Tenders Crispy x9',            'fried',   485, 36, 32, 25, ['chicken']],
  ['Nuggets x6',                   'fried',   245, 14, 13, 14, ['chicken']],
  ['Nuggets x9',                   'fried',   368, 21, 19, 21, ['chicken']],
  ['Hot Wings x4',                 'fried',   295, 19, 12, 19, ['chicken']],
  ['Hot Wings x6',                 'fried',   442, 28, 18, 28, ['chicken']],
  // Veggie & Fish
  ['Veggie King',                  'burger',  470, 18, 60, 18, ['vegetarian','burger']],
  ['Veggie Steakhouse',            'burger',  595, 22, 70, 25, ['vegetarian','cheese','burger']],
  ['Big Fish',                     'burger',  555, 20, 51, 30, ['fish','burger']],
  ['King Fish',                    'burger',  410, 16, 39, 20, ['fish','burger']],
  // Wraps
  ['Wrap Tenders Crispy',          'wrap',    410, 18, 42, 18, ['chicken','wrap']],
  ['Wrap Tenders Salsa',           'wrap',    395, 18, 43, 16, ['chicken','wrap']],
  ['Wrap Big Steak',               'wrap',    490, 22, 46, 22, ['beef','wrap']],
  ['Wrap Sweet Chili',             'wrap',    400, 16, 45, 16, ['chicken','wrap']],
  // Sides
  ['Frites Small',                 'side',    195, 3,  25, 9,  []],
  ['Frites Medium',                'side',    310, 5,  39, 14, []],
  ['Frites Large',                 'side',    430, 7,  53, 20, []],
  ['Onion Rings Small',            'side',    255, 3,  30, 13, []],
  ['Onion Rings Medium',           'side',    340, 4,  40, 17, []],
  ['Potatoes',                     'side',    295, 4,  35, 15, []],
  // Desserts
  ['Sundae Chocolat',              'dessert', 290, 6,  46, 9,  ['dessert']],
  ['Sundae Caramel',               'dessert', 315, 6,  53, 8,  ['dessert']],
  ['King Fusion Daim',             'dessert', 405, 8,  56, 17, ['dessert']],
  ['King Fusion Oreo',             'dessert', 395, 8,  56, 16, ['dessert']],
  ['King Fusion Kit Kat',          'dessert', 415, 8,  57, 18, ['dessert']],
  ['Cookie Chocolat',              'dessert', 220, 3,  29, 10, ['dessert']],
  ['Muffin Chocolat',              'dessert', 380, 5,  47, 19, ['dessert']],
  ['Donut Sucre',                  'dessert', 295, 4,  39, 13, ['dessert']],
  ['Donut Chocolat',               'dessert', 320, 4,  42, 15, ['dessert']],
  ['Milkshake Vanille',            'drink',   360, 9,  62, 8,  ['dessert']],
  ['Milkshake Chocolat',           'drink',   400, 10, 71, 9,  ['dessert']],
];

// ============================== KFC France ==============================
const KFC = [
  // Pieces
  ['Original Recipe (1 pièce)',    'fried',   240, 22, 8,  14, ['chicken']],
  ['Crispy (1 pièce)',             'fried',   295, 22, 12, 18, ['chicken']],
  ['Hot Wings (1 pièce)',          'fried',   80,  6,  3,  5,  ['chicken']],
  ['Hot Wings x6',                 'fried',   470, 35, 19, 28, ['chicken']],
  ['Hot Wings x10',                'fried',   780, 58, 32, 47, ['chicken']],
  ['Tenders (1 pièce)',            'fried',   115, 10, 7,  5,  ['chicken']],
  ['Tenders x3',                   'fried',   343, 30, 21, 16, ['chicken']],
  ['Tenders x5',                   'fried',   570, 50, 35, 27, ['chicken']],
  ['Pop-Corn Chicken Snack',       'fried',   245, 16, 14, 14, ['chicken']],
  ['Pop-Corn Chicken Medium',      'fried',   438, 28, 25, 25, ['chicken']],
  ['Pop-Corn Chicken Large',       'fried',   620, 39, 35, 35, ['chicken']],
  ['Mini Fillet (1)',              'fried',   123, 8,  10, 5,  ['chicken']],
  // Burgers
  ['Tower Original',               'burger',  550, 30, 50, 25, ['chicken','cheese','burger']],
  ['Tower Hot',                    'burger',  555, 30, 50, 25, ['chicken','cheese','burger']],
  ['Tower Cheese',                 'burger',  590, 32, 50, 28, ['chicken','cheese','burger']],
  ['Colonel Burger Original',      'burger',  430, 22, 41, 19, ['chicken','burger']],
  ['Colonel Burger Cheese',        'burger',  475, 24, 42, 22, ['chicken','cheese','burger']],
  ['Crispy Burger',                'burger',  410, 20, 38, 19, ['chicken','burger']],
  ['Krunchy Burger',               'burger',  395, 19, 39, 18, ['chicken','burger']],
  ['Kentucky Fillet Burger',       'burger',  445, 24, 42, 19, ['chicken','burger']],
  ['Master Original',              'burger',  650, 32, 53, 32, ['chicken','cheese','burger']],
  ['Bacon Cheese Burger',          'burger',  515, 28, 41, 25, ['chicken','cheese','burger']],
  ['Veggie Burger',                'burger',  395, 12, 45, 18, ['vegetarian','burger']],
  ['Legend Burger',                'burger',  540, 27, 47, 26, ['chicken','cheese','burger']],
  // Wraps
  ['Boxmaster Original',           'wrap',    635, 27, 65, 28, ['chicken','wrap']],
  ['Boxmaster Hot',                'wrap',    640, 27, 65, 28, ['chicken','wrap']],
  ['Boxmaster Cheese',             'wrap',    685, 30, 66, 32, ['chicken','cheese','wrap']],
  ['Twister',                      'wrap',    490, 23, 49, 22, ['chicken','wrap']],
  ['Crousti Fromage Raclette',     'wrap',    615, 25, 56, 32, ['chicken','cheese','wrap']],
  // Salads
  ['Salade Caesar Crispy',         'salad',   355, 25, 28, 16, ['chicken','salad']],
  ['Salade Caesar Grillé',         'salad',   285, 28, 22, 10, ['chicken','salad']],
  // Sides
  ['Frites Snack',                 'side',    225, 3,  29, 11, []],
  ['Frites Moyenne',               'side',    340, 5,  43, 16, []],
  ['Frites Maxi',                  'side',    455, 6,  58, 22, []],
  ['Potatoes (Wedges)',            'side',    320, 5,  37, 17, []],
  ['Onion Rings',                  'side',    285, 4,  35, 14, []],
  ['Coleslaw',                     'side',    155, 1,  10, 12, []],
  ['Mini Épi Maïs',                'side',    75,  2,  16, 1,  ['vegetarian']],
  // Desserts
  ['Sundae Chocolat',              'dessert', 295, 6,  47, 9,  ['dessert']],
  ['Sundae Caramel',               'dessert', 320, 6,  54, 8,  ['dessert']],
  ['Sundae Fraise',                'dessert', 280, 6,  50, 6,  ['dessert']],
  ['iTwist Daim',                  'dessert', 410, 8,  54, 18, ['dessert']],
  ['iTwist Oreo',                  'dessert', 405, 8,  55, 17, ['dessert']],
  ['CroustiKream Nutella',         'dessert', 295, 5,  35, 14, ['dessert']],
  ['Donut',                        'dessert', 290, 4,  37, 13, ['dessert']],
  ['Cookie',                       'dessert', 215, 3,  28, 9,  ['dessert']],
];

// ============================== Quick (France) ==============================
const QUICK = [
  ['Giant',                        'burger',  555, 27, 41, 30, ['beef','cheese','burger']],
  ['Cheese Giant',                 'burger',  610, 30, 41, 33, ['beef','cheese','burger']],
  ['Bacon Cheese Giant',           'burger',  680, 35, 41, 39, ['beef','cheese','burger']],
  ['Big Cheese',                   'burger',  482, 28, 32, 25, ['beef','cheese','burger']],
  ['Quick\'n Cheese',              'burger',  330, 16, 28, 16, ['beef','cheese','burger']],
  ['Hamburger',                    'burger',  255, 14, 28, 9,  ['beef','burger']],
  ['Cheeseburger',                 'burger',  302, 17, 28, 13, ['beef','cheese','burger']],
  ['Double Cheese',                'burger',  455, 27, 28, 25, ['beef','cheese','burger']],
  ['Long Bacon',                   'burger',  525, 25, 50, 24, ['beef','cheese','burger']],
  ['Long Cheese',                  'burger',  490, 23, 51, 21, ['beef','cheese','burger']],
  ['Supreme Cheese',               'burger',  720, 38, 47, 41, ['beef','cheese','burger']],
  ['Supreme Bacon',                'burger',  745, 40, 46, 43, ['beef','cheese','burger']],
  ['Magic Box',                    'burger',  475, 22, 43, 23, ['beef','cheese','burger']],
  ['Veggie Burger',                'burger',  445, 16, 50, 19, ['vegetarian','burger']],
  ['Long Fish',                    'burger',  515, 18, 51, 26, ['fish','burger']],
  ['Long Chicken',                 'burger',  475, 21, 50, 20, ['chicken','burger']],
  ['Crousty Chicken',              'burger',  370, 17, 38, 16, ['chicken','burger']],
  ['Quick\'n Toast Cheese',        'sandwich',265, 14, 27, 11, ['cheese']],
  ['Quick\'n Toast Bacon',         'sandwich',310, 17, 27, 15, ['cheese']],
  ['Wrap Sweet Chili',             'wrap',    400, 17, 44, 16, ['chicken','wrap']],
  ['Wrap Caesar',                  'wrap',    415, 19, 42, 18, ['chicken','wrap']],
  // Finger food
  ['Onion Rings (5)',              'side',    260, 3,  31, 13, []],
  ['Frites Petit',                 'side',    220, 3,  28, 10, []],
  ['Frites Moyen',                 'side',    335, 4,  42, 16, []],
  ['Frites Maxi',                  'side',    445, 6,  56, 21, []],
  ['Potatoes',                     'side',    285, 4,  33, 14, []],
  ['Chicken Dips x4',              'fried',   220, 16, 14, 11, ['chicken']],
  ['Chicken Dips x6',              'fried',   330, 24, 21, 17, ['chicken']],
  ['Nuggets x6',                   'fried',   265, 15, 14, 16, ['chicken']],
  ['Hot Wings x4',                 'fried',   285, 18, 12, 18, ['chicken']],
  // Salads
  ['Salade Caesar Poulet',         'salad',   265, 22, 14, 12, ['chicken','salad']],
  ['Salade Veggie',                'salad',   170, 7,  16, 7,  ['vegetarian','salad']],
  // Desserts
  ['Sundae Chocolat',              'dessert', 295, 6,  46, 9,  ['dessert']],
  ['Sundae Caramel',               'dessert', 320, 6,  54, 8,  ['dessert']],
  ['Mister Freeze',                'dessert', 75,  0,  19, 0,  ['dessert']],
  ['Cookie Chocolat',              'dessert', 215, 3,  28, 9,  ['dessert']],
  ['Brownie',                      'dessert', 230, 3,  29, 11, ['dessert']],
  ['Donut',                        'dessert', 285, 4,  37, 13, ['dessert']],
  ['Milk-Shake Vanille',           'drink',   355, 9,  61, 8,  ['dessert']],
  ['Milk-Shake Chocolat',          'drink',   395, 10, 70, 9,  ['dessert']],
  ['Milk-Shake Fraise',            'drink',   360, 9,  64, 8,  ['dessert']],
];

// ============================== O'Tacos ==============================
// Sizes: M (1 viande), L (2 viandes), XL (3 viandes). All include frites + sauce fromagère inside.
const OTACOS = [
  ['Tacos M Poulet',               'taco',    715,  35, 70, 33, ['chicken']],
  ['Tacos M Cordon Bleu',          'taco',    790,  36, 72, 38, ['chicken','cheese']],
  ['Tacos M Nuggets',              'taco',    760,  32, 73, 36, ['chicken']],
  ['Tacos M Steak Haché',          'taco',    750,  36, 70, 36, ['beef']],
  ['Tacos M Bœuf Émincé',          'taco',    755,  37, 71, 36, ['beef']],
  ['Tacos M Merguez',              'taco',    770,  29, 70, 40, ['beef']],
  ['Tacos M Cheese',               'taco',    695,  22, 70, 33, ['vegetarian','cheese']],
  ['Tacos L Poulet+Steak',         'taco',    1015, 53, 95, 47, ['chicken','beef']],
  ['Tacos L Poulet+Cordon Bleu',   'taco',    1085, 52, 96, 53, ['chicken','cheese']],
  ['Tacos L Cordon Bleu+Steak',    'taco',    1095, 53, 95, 54, ['chicken','beef','cheese']],
  ['Tacos L Nuggets+Poulet',       'taco',    1045, 52, 99, 50, ['chicken']],
  ['Tacos L Steak+Merguez',        'taco',    1060, 51, 95, 54, ['beef']],
  ['Tacos XL Triple Viande',       'taco',    1395, 71, 130,67, ['chicken','beef','cheese']],
  ['Tacos XL Mix Viandes',         'taco',    1420, 70, 132,68, ['chicken','beef']],
  ['Gigatacos (Special)',          'taco',    1850, 92, 175,87, ['chicken','beef','cheese']],
  // Sides
  ['Frites M',                     'side',    335,  4,  42, 16, []],
  ['Frites L',                     'side',    445,  6,  56, 21, []],
  ['Frites Cheddar',               'side',    495,  10, 47, 26, ['cheese']],
  ['Onion Rings',                  'side',    285,  4,  35, 14, []],
  ['Mozza Sticks (4)',             'fried',   325,  14, 26, 19, ['cheese']],
  ['Bites Poulet (5)',             'fried',   295,  18, 21, 14, ['chicken']],
  ['Nuggets (6)',                  'fried',   265,  15, 14, 16, ['chicken']],
  // Desserts
  ['Brownie',                      'dessert', 220,  3,  28, 11, ['dessert']],
  ['Cookie',                       'dessert', 215,  3,  28, 9,  ['dessert']],
  ['Donut Sucre',                  'dessert', 285,  4,  37, 13, ['dessert']],
  ['Donut Choco',                  'dessert', 320,  4,  42, 15, ['dessert']],
  // Drinks
  ['Milkshake Vanille',            'drink',   360,  9,  62, 8,  ['dessert']],
  ['Milkshake Chocolat',           'drink',   395,  10, 70, 9,  ['dessert']],
  ['Milkshake Oreo',               'drink',   415,  10, 70, 11, ['dessert']],
];

// ============================== Chicken Street ==============================
const CHICKENSTREET = [
  // Naan / Burger Naan
  ['Naan Tenders',                 'sandwich',605, 28, 56, 28, ['chicken']],
  ['Naan Farmer',                  'sandwich',650, 30, 58, 30, ['chicken','cheese']],
  ['Naan Radikal',                 'sandwich',720, 32, 60, 38, ['chicken','cheese']],
  ['Naan Mix',                     'sandwich',680, 30, 60, 32, ['chicken']],
  ['Naan Supreme',                 'sandwich',730, 32, 62, 38, ['chicken','cheese']],
  ['Naan Curry',                   'sandwich',610, 28, 58, 26, ['chicken']],
  ['Naan Tikka',                   'sandwich',625, 30, 58, 26, ['chicken']],
  ['Naan Thai',                    'sandwich',605, 28, 60, 24, ['chicken']],
  ['Naan Tender Steak',            'sandwich',730, 36, 60, 36, ['chicken','beef']],
  ['Naan Imperial',                'sandwich',780, 36, 62, 42, ['chicken','beef','cheese']],
  ['Naan Steak',                   'sandwich',680, 32, 58, 32, ['beef']],
  ['Naan Dynamite',                'sandwich',715, 30, 60, 36, ['chicken']],
  // Burgers
  ['Cheese Burger',                'burger',  370, 18, 32, 18, ['beef','cheese','burger']],
  ['Double Cheese Burger',         'burger',  555, 32, 32, 30, ['beef','cheese','burger']],
  ['Twice Burger',                 'burger',  585, 30, 38, 30, ['chicken','cheese','burger']],
  ['Street B Burger',              'burger',  620, 28, 50, 30, ['chicken','cheese','burger']],
  ['Tower Burger',                 'burger',  745, 32, 56, 40, ['chicken','cheese','burger']],
  ['BBQ Burger',                   'burger',  610, 26, 52, 30, ['chicken','burger']],
  ['Dynamite Burger',              'burger',  665, 28, 50, 36, ['chicken','burger']],
  ['Bacon & Oignon Burger',        'burger',  640, 28, 48, 34, ['beef','cheese','burger']],
  ['Fury Burger',                  'burger',  720, 32, 52, 40, ['chicken','cheese','burger']],
  // Wraps
  ['Wrap Monster',                 'wrap',    575, 24, 50, 28, ['chicken','wrap']],
  ['Wrap Tenders',                 'wrap',    485, 22, 47, 22, ['chicken','wrap']],
  ['Little Tender Wrap',           'wrap',    365, 16, 38, 16, ['chicken','wrap']],
  ['Wrap BBQ',                     'wrap',    495, 22, 50, 21, ['chicken','wrap']],
  ['Wrap Dynamite',                'wrap',    515, 22, 49, 24, ['chicken','wrap']],
  // Fried chicken
  ['Tenders x4',                   'fried',   460, 32, 28, 22, ['chicken']],
  ['Tenders x6',                   'fried',   690, 48, 42, 33, ['chicken']],
  ['Spicy Tenders x4',             'fried',   470, 32, 28, 23, ['chicken']],
  ['Dynamite Tenders x4',          'fried',   500, 32, 30, 26, ['chicken']],
  ['Wings x6',                     'fried',   450, 30, 16, 28, ['chicken']],
  ['Wings x10',                    'fried',   750, 50, 27, 47, ['chicken']],
  ['Nuggets x6',                   'fried',   265, 15, 14, 16, ['chicken']],
  ['Family Mix Bucket',            'fried',   1450,90, 70, 80, ['chicken']],
  ['Tenders\'n\'Cheese',           'fried',   560, 30, 32, 30, ['chicken','cheese']],
  // Sides
  ['Frites M',                     'side',    285, 4,  35, 14, []],
  ['Frites L',                     'side',    420, 6,  53, 20, []],
  ['Frites Cheddar',               'side',    495, 10, 47, 26, ['cheese']],
  ['Frites Cheddar Bacon',         'side',    560, 16, 47, 32, ['cheese']],
  ['Mozza Sticks (4)',             'fried',   325, 14, 26, 19, ['cheese']],
  ['Chili Cheese Nuggets (6)',     'fried',   320, 12, 25, 19, ['cheese']],
  ['Onion Rings',                  'side',    285, 4,  35, 14, []],
  // Bowls
  ['Bowl Cheddar & Bacon',         'main',    640, 32, 60, 28, ['chicken','cheese']],
  ['Bowl Dynamite',                'main',    615, 30, 58, 27, ['chicken']],
  // Desserts
  ['Ice Mix',                      'dessert', 290, 6,  46, 9,  ['dessert']],
  ['Ice Street',                   'dessert', 320, 6,  54, 8,  ['dessert']],
  ['Pot de Glace',                 'dessert', 250, 4,  35, 11, ['dessert']],
  ['Tiramisu',                     'dessert', 320, 6,  35, 17, ['dessert']],
  ['Tarte au Daim',                'dessert', 380, 5,  44, 19, ['dessert']],
  ['Tarte Choco Coco',             'dessert', 360, 4,  42, 19, ['dessert']],
];

// ============================== Peppe Chicken ==============================
const PEPE = [
  ['Box Tenders x3',               'fried',   345, 24, 21, 16, ['chicken']],
  ['Box Spicy Tenders x3',         'fried',   355, 24, 22, 17, ['chicken']],
  ['Pepe Tenders x4',              'fried',   460, 32, 28, 22, ['chicken']],
  ['Pepe Spicy Tenders x4',        'fried',   470, 32, 28, 23, ['chicken']],
  ['Pepe Wings x5',                'fried',   400, 27, 14, 25, ['chicken']],
  ['Pepe Spicy Wings x5',          'fried',   410, 27, 14, 26, ['chicken']],
  ['Big Box Pepe',                 'fried',   850, 50, 45, 50, ['chicken']],
  ['Big Box Spicy',                'fried',   870, 50, 45, 52, ['chicken']],
  ['The Hot One Burger',           'burger',  640, 28, 50, 35, ['chicken','cheese','burger']],
  ['The Smoky One Burger',         'burger',  610, 27, 50, 32, ['chicken','cheese','burger']],
  ['Pepe Burger',                  'burger',  555, 26, 47, 28, ['chicken','burger']],
  ['Mexican Burger',               'burger',  595, 26, 50, 30, ['chicken','cheese','burger']],
  ['Grand Wrap Crispy Bacon',      'wrap',    525, 22, 49, 24, ['chicken','cheese','wrap']],
  ['Pepe Snack Wrap',              'wrap',    370, 16, 38, 17, ['chicken','wrap']],
  ['Salade Pepe',                  'salad',   305, 25, 18, 14, ['chicken','salad']],
  ['Pepe PopCorn',                 'fried',   355, 22, 22, 19, ['chicken']],
  ['Pepe PopCorn Spicy',           'fried',   360, 22, 22, 20, ['chicken']],
  ['Maïs Grillé',                  'side',    95,  3,  19, 1,  ['vegetarian']],
  ['Tater Tots',                   'side',    295, 4,  35, 15, []],
  ['Waffle Fries',                 'side',    340, 5,  42, 17, []],
  ['Frites Patate Douce',          'side',    320, 4,  44, 14, []],
  ['Original Pepe Sauce',          'side',    100, 0,  4,  9,  []],
  ['Pepe Hot Sauce',               'side',    50,  0,  6,  3,  []],
  ['Creamy BBQ Sauce',             'side',    105, 0,  6,  9,  []],
];

// ============================== Subway France (15cm / 6") ==============================
const SUBWAY = [
  ['Italien BMT (15cm)',           'sandwich',410, 22, 47, 16, ['beef','cheese']],
  ['Subway Melt (15cm)',           'sandwich',390, 24, 47, 13, ['cheese']],
  ['Steak & Cheese (15cm)',        'sandwich',380, 22, 48, 11, ['beef','cheese']],
  ['Steakhouse (15cm)',            'sandwich',445, 22, 48, 19, ['beef','cheese']],
  ['Bœuf Pastrami (15cm)',         'sandwich',390, 24, 48, 11, ['beef']],
  ['Poulet Teriyaki (15cm)',       'sandwich',360, 25, 53, 6,  ['chicken']],
  ['Poulet Tikka (15cm)',          'sandwich',345, 24, 51, 6,  ['chicken']],
  ['Super Smoky Chicken Bacon',    'sandwich',445, 28, 49, 16, ['chicken','cheese']],
  ['Original Smoky Chicken',       'sandwich',390, 26, 49, 11, ['chicken']],
  ['Poulet (15cm)',                'sandwich',310, 24, 47, 4,  ['chicken']],
  ['Jambon (15cm)',                'sandwich',290, 18, 46, 5,  []],
  ['Dinde (15cm)',                 'sandwich',285, 18, 46, 4,  []],
  ['Thon (15cm)',                  'sandwich',445, 21, 44, 22, ['fish']],
  ['Veggie Delite (15cm)',         'sandwich',230, 9,  44, 3,  ['vegetarian']],
  ['Veggie Quinoa Kale',           'sandwich',335, 12, 50, 9,  ['vegetarian']],
  ['Galette Légumes Vegan',        'sandwich',355, 14, 53, 9,  ['vegetarian']],
  // Wraps
  ['Wrap Bœuf Guacamole',          'wrap',    490, 25, 45, 22, ['beef','wrap']],
  ['Wrap Poulet Caesar',           'wrap',    470, 26, 44, 20, ['chicken','wrap']],
  // Salads
  ['Salade Italien BMT',           'salad',   280, 19, 14, 16, ['beef','cheese','salad']],
  ['Salade Poulet Teriyaki',       'salad',   210, 22, 18, 5,  ['chicken','salad']],
  ['Salade Poulet Tikka',          'salad',   195, 21, 17, 4,  ['chicken','salad']],
  ['Salade Thon',                  'salad',   325, 18, 8,  22, ['fish','salad']],
  ['Salade Veggie Delite',         'salad',   75,  4,  13, 1,  ['vegetarian','salad']],
  ['Salade Steak & Cheese',        'salad',   245, 19, 11, 11, ['beef','cheese','salad']],
  // Desserts
  ['Cookie Pépites Chocolat',      'dessert', 215, 2,  29, 10, ['dessert']],
  ['Cookie Double Chocolat',       'dessert', 220, 3,  28, 11, ['dessert']],
  ['Cookie Avoine & Raisins',      'dessert', 200, 3,  31, 7,  ['dessert']],
  ['Cookie Macadamia',             'dessert', 230, 3,  29, 12, ['dessert']],
  ['Brownie',                      'dessert', 235, 3,  31, 11, ['dessert']],
  ['Muffin Chocolat',              'dessert', 380, 5,  47, 19, ['dessert']],
];

// ============================== Paul (boulangerie) ==============================
const PAUL = [
  // Sandwiches
  ['Sandwich Jambon Beurre',       'sandwich',430, 17, 50, 17, []],
  ['Sandwich Jambon Emmental',     'sandwich',495, 22, 50, 21, ['cheese']],
  ['Sandwich Poulet Crudités',     'sandwich',440, 22, 49, 16, ['chicken']],
  ['Sandwich Thon Crudités',       'sandwich',460, 18, 48, 21, ['fish']],
  ['Sandwich Œuf Crudités',        'sandwich',420, 16, 50, 17, []],
  ['Sandwich Saumon Concombre',    'sandwich',475, 22, 50, 21, ['fish']],
  ['Sandwich Mozzarella Tomate',   'sandwich',475, 18, 52, 21, ['vegetarian','cheese']],
  ['Sandwich Poulet Curry',        'sandwich',460, 22, 50, 17, ['chicken']],
  // Croque & toast
  ['Croque-Monsieur',              'main',    485, 26, 38, 24, ['cheese']],
  ['Croque-Madame',                'main',    560, 30, 38, 30, ['cheese']],
  ['Quiche Lorraine',              'main',    440, 17, 32, 27, ['cheese']],
  ['Quiche Saumon Épinard',        'main',    430, 18, 30, 26, ['fish']],
  ['Quiche Poulet Champignons',    'main',    420, 19, 30, 24, ['chicken']],
  // Salads
  ['Salade César Poulet',          'salad',   355, 22, 24, 19, ['chicken','salad']],
  ['Salade Périgourdine',          'salad',   415, 24, 22, 25, ['salad']],
  ['Salade Niçoise',               'salad',   320, 22, 16, 17, ['fish','salad']],
  ['Salade Saumon Quinoa',         'salad',   385, 24, 30, 17, ['fish','salad']],
  // Soup
  ['Velouté Légumes',              'main',    155, 5,  20, 6,  ['vegetarian']],
  ['Soupe Tomate Basilic',         'main',    145, 4,  22, 5,  ['vegetarian']],
  // Viennoiseries
  ['Croissant',                    'breakfast',225,4,  25, 12, ['breakfast']],
  ['Pain au Chocolat',             'breakfast',280,5,  31, 14, ['breakfast']],
  ['Pain aux Raisins',             'breakfast',310,5,  39, 13, ['breakfast']],
  ['Brioche au Sucre',             'breakfast',270,5,  35, 11, ['breakfast']],
  ['Chausson aux Pommes',          'breakfast',315,4,  37, 16, ['breakfast']],
  ['Tartelette aux Fraises',       'dessert', 285, 4,  38, 12, ['dessert']],
  ['Tartelette aux Fruits',        'dessert', 295, 4,  39, 12, ['dessert']],
  ['Tarte Citron Meringuée',       'dessert', 360, 5,  47, 16, ['dessert']],
  ['Tarte au Chocolat',            'dessert', 410, 6,  44, 22, ['dessert']],
  ['Éclair Chocolat',              'dessert', 285, 5,  35, 13, ['dessert']],
  ['Éclair Café',                  'dessert', 270, 5,  33, 12, ['dessert']],
  ['Religieuse Chocolat',          'dessert', 385, 7,  42, 19, ['dessert']],
  ['Mille-Feuille',                'dessert', 425, 6,  46, 23, ['dessert']],
  ['Macaron (1)',                  'dessert', 95,  1,  13, 4,  ['dessert']],
  ['Madeleine',                    'dessert', 95,  1,  12, 5,  ['dessert']],
  ['Cookie Chocolat',              'dessert', 215, 3,  28, 9,  ['dessert']],
  ['Brownie',                      'dessert', 230, 3,  29, 11, ['dessert']],
  ['Tarte Tatin (part)',           'dessert', 320, 3,  43, 15, ['dessert']],
  ['Flan Pâtissier (part)',        'dessert', 295, 6,  35, 14, ['dessert']],
  ['Mini Quiche Lorraine',         'starter', 170, 6,  12, 11, ['cheese']],
  ['Mini Pizza',                   'starter', 180, 7,  18, 8,  ['cheese']],
  ['Friand Poulet',                'starter', 285, 9,  25, 16, ['chicken']],
  ['Pain de Mie Saumon',           'sandwich',310, 16, 27, 15, ['fish']],
];

// ============================== Matsuri (Japanese) ==============================
const MATSURI = [
  // Maki 6 pcs
  ['Maki Saumon (6 pcs)',          'maki',    175, 9,  29, 3,  ['salmon','japanese']],
  ['Maki Thon (6 pcs)',            'maki',    160, 10, 28, 1,  ['tuna','japanese']],
  ['Maki Concombre (6 pcs)',       'maki',    140, 4,  30, 1,  ['vegetarian','japanese']],
  ['Maki Avocat (6 pcs)',          'maki',    180, 4,  29, 6,  ['vegetarian','japanese']],
  ['Maki Saumon Avocat (6 pcs)',   'maki',    220, 9,  29, 8,  ['salmon','japanese']],
  ['Maki Crevette Avocat (6 pcs)', 'maki',    195, 10, 29, 5,  ['shrimp','japanese']],
  // California 8 pcs
  ['California Saumon Avocat',     'maki',    310, 13, 42, 10, ['salmon','japanese']],
  ['California Thon Avocat',       'maki',    285, 14, 42, 7,  ['tuna','japanese']],
  ['California Crevette Avocat',   'maki',    295, 14, 42, 8,  ['shrimp','japanese']],
  ['California Crabe',             'maki',    285, 12, 42, 8,  ['japanese']],
  ['California Poulet Tempura',    'maki',    340, 14, 44, 12, ['chicken','japanese']],
  ['Crispy Roll Saumon',           'maki',    345, 14, 42, 13, ['salmon','japanese']],
  ['Spring Roll Saumon Avocat',    'maki',    300, 12, 40, 10, ['salmon','japanese']],
  // Sushi (2 pcs)
  ['Sushi Saumon (2 pcs)',         'sushi',   95,  8,  14, 1,  ['salmon','japanese']],
  ['Sushi Thon (2 pcs)',           'sushi',   85,  9,  14, 0,  ['tuna','japanese']],
  ['Sushi Crevette (2 pcs)',       'sushi',   80,  7,  14, 0,  ['shrimp','japanese']],
  ['Sushi Daurade (2 pcs)',        'sushi',   85,  8,  14, 1,  ['japanese']],
  // Sashimi (5 pcs)
  ['Sashimi Saumon (5 pcs)',       'sashimi', 150, 22, 0,  7,  ['salmon','japanese']],
  ['Sashimi Thon (5 pcs)',         'sashimi', 110, 24, 0,  2,  ['tuna','japanese']],
  ['Sashimi Mixte (9 pcs)',        'sashimi', 235, 38, 0,  8,  ['japanese']],
  // Brochettes
  ['Brochette Poulet (2)',         'main',    140, 18, 6,  5,  ['chicken','japanese']],
  ['Brochette Bœuf Cheese',        'main',    220, 18, 4,  14, ['beef','cheese','japanese']],
  ['Brochette Saumon (2)',         'main',    160, 22, 1,  7,  ['salmon','japanese']],
  ['Brochette Boulettes Poulet',   'main',    160, 14, 4,  9,  ['chicken','japanese']],
  // Bowls / poke
  ['Poke Bowl Saumon',             'main',    520, 26, 65, 17, ['salmon','japanese']],
  ['Poke Bowl Thon Spicy',         'main',    495, 28, 60, 16, ['tuna','japanese']],
  ['Poke Bowl Crevettes',          'main',    485, 24, 65, 14, ['shrimp','japanese']],
  ['Poke Bowl Veggie',             'main',    420, 12, 70, 11, ['vegetarian','japanese']],
  ['Chirashi Saumon',              'main',    470, 26, 60, 13, ['salmon','japanese']],
  ['Chirashi Mixte',               'main',    495, 28, 60, 14, ['japanese']],
  // Plateaux
  ['Plateau Découverte 16 pcs',    'main',    480, 24, 65, 12, ['salmon','japanese']],
  ['Plateau Famille 32 pcs',       'main',    960, 48, 130,24, ['salmon','japanese']],
  // Starters
  ['Soupe Miso',                   'starter', 50,  3,  6,  2,  ['japanese']],
  ['Salade Choux',                 'salad',   85,  2,  9,  4,  ['japanese']],
  ['Edamame',                      'starter', 130, 11, 10, 5,  ['vegetarian','japanese']],
  ['Gyoza Poulet (5)',             'starter', 245, 12, 28, 9,  ['chicken','japanese']],
  ['Gyoza Crevettes (5)',          'starter', 240, 14, 28, 8,  ['shrimp','japanese']],
  ['Tempura Crevettes (4)',        'starter', 260, 12, 22, 14, ['shrimp','japanese']],
  ['Salade de Riz Vinaigré',       'salad',   220, 4,  48, 1,  ['japanese']],
  ['Katsu Poulet Sauce Tonkatsu',  'main',    560, 36, 58, 18, ['chicken','japanese']],
  // Desserts
  ['Mochi Glacé Coco',             'dessert', 105, 1,  18, 3,  ['dessert']],
  ['Mochi Glacé Mangue',           'dessert', 95,  1,  17, 2,  ['dessert']],
  ['Mochi Glacé Chocolat',         'dessert', 115, 2,  18, 4,  ['dessert']],
  ['Perles de Coco',               'dessert', 120, 2,  22, 3,  ['dessert']],
  ['Litchi au Sirop',              'dessert', 110, 1,  28, 0,  ['dessert']],
];

// ============================== Le Louchebem (brasserie) ==============================
const LOUCHEBEM = [
  // Entrées
  ['Foie Gras Maison',             'starter', 380, 8,  6,  35, ['french']],
  ['Terrine de Campagne',          'starter', 320, 14, 4,  28, ['french']],
  ['Œufs Mayo',                    'starter', 245, 12, 2,  20, ['french']],
  ['Tartare de Saumon',            'starter', 290, 22, 6,  20, ['fish','french']],
  ['Salade de Chèvre Chaud',       'starter', 425, 17, 22, 30, ['vegetarian','cheese']],
  ['Carpaccio de Bœuf',            'starter', 285, 24, 5,  19, ['beef','french']],
  ['Soupe à l\'Oignon Gratinée',   'starter', 320, 12, 26, 17, ['cheese','french']],
  ['Escargots de Bourgogne (6)',   'starter', 260, 8,  6,  22, ['french']],
  ['Charcuterie Maison',           'starter', 480, 25, 4,  40, ['french']],
  // Plats
  ['Entrecôte 250g',               'main',    685, 60, 0,  48, ['beef','french']],
  ['Faux-filet 250g',              'main',    640, 58, 0,  44, ['beef','french']],
  ['Filet de Bœuf 200g',           'main',    520, 50, 0,  35, ['beef','french']],
  ['Pavé de Rumsteck 220g',        'main',    580, 55, 0,  40, ['beef','french']],
  ['Côte de Bœuf (par 100g)',      'main',    260, 24, 0,  18, ['beef','french']],
  ['Tartare de Bœuf au Couteau',   'main',    615, 50, 12, 38, ['beef','french']],
  ['Steak Haché Maison 200g',      'main',    480, 42, 4,  32, ['beef','french']],
  ['Magret de Canard',             'main',    650, 45, 6,  48, ['french']],
  ['Confit de Canard',             'main',    720, 42, 8,  55, ['french']],
  ['Onglet à l\'Échalote',         'main',    560, 48, 6,  37, ['beef','french']],
  ['Pavé de Saumon Grillé',        'main',    470, 38, 4,  32, ['fish']],
  ['Filet de Bar Plancha',         'main',    340, 38, 2,  20, ['fish']],
  ['Suprême de Volaille Fermière', 'main',    420, 42, 8,  22, ['chicken','french']],
  // Sides
  ['Frites Maison',                'side',    310, 5,  39, 14, []],
  ['Pommes Sautées',               'side',    260, 4,  35, 12, []],
  ['Gratin Dauphinois',            'side',    320, 9,  26, 20, ['cheese']],
  ['Légumes du Jour',              'side',    150, 5,  18, 6,  ['vegetarian']],
  ['Haricots Verts',               'side',    120, 4,  14, 5,  ['vegetarian']],
  ['Purée Maison',                 'side',    240, 6,  30, 10, ['vegetarian']],
  ['Salade Verte',                 'salad',   85,  2,  6,  6,  ['vegetarian']],
  // Desserts
  ['Crème Brûlée',                 'dessert', 420, 6,  40, 26, ['dessert']],
  ['Profiteroles au Chocolat',     'dessert', 520, 9,  48, 32, ['dessert']],
  ['Tarte Tatin Crème Fraîche',    'dessert', 460, 5,  60, 21, ['dessert']],
  ['Mousse au Chocolat',           'dessert', 380, 7,  35, 22, ['dessert']],
  ['Café Gourmand',                'dessert', 410, 6,  48, 20, ['dessert']],
  ['Île Flottante',                'dessert', 320, 8,  45, 11, ['dessert']],
  ['Fromage Blanc Coulis',         'dessert', 220, 12, 28, 6,  ['dessert']],
  ['Plateau de Fromages',          'dessert', 380, 24, 4,  30, ['cheese']],
];

// ============================== Amorino (gelato) ==============================
// Per medium portion (~120g) unless noted.
const AMORINO = [
  ['Gelato Pistache (M)',          'ice cream',280, 4,  32, 14, ['dessert']],
  ['Gelato Stracciatella (M)',     'ice cream',265, 4,  32, 13, ['dessert']],
  ['Gelato Chocolat Noir (M)',     'ice cream',290, 4,  35, 14, ['dessert']],
  ['Gelato Chocolat Lait (M)',     'ice cream',285, 5,  35, 13, ['dessert']],
  ['Gelato Vanille (M)',           'ice cream',265, 4,  31, 13, ['dessert']],
  ['Gelato Caramel Beurre Salé',   'ice cream',305, 4,  37, 15, ['dessert']],
  ['Gelato Noisette (M)',          'ice cream',285, 5,  32, 15, ['dessert']],
  ['Gelato Café (M)',              'ice cream',260, 4,  32, 12, ['dessert']],
  ['Gelato Tiramisu (M)',          'ice cream',290, 4,  33, 15, ['dessert']],
  ['Gelato Speculoos (M)',         'ice cream',290, 4,  35, 14, ['dessert']],
  ['Gelato Cookies (M)',           'ice cream',300, 4,  36, 15, ['dessert']],
  ['Gelato Nutella (M)',           'ice cream',295, 5,  34, 15, ['dessert']],
  ['Gelato Bacio (M)',             'ice cream',310, 5,  34, 17, ['dessert']],
  ['Gelato Yaourt (M)',            'ice cream',195, 6,  31, 5,  ['dessert']],
  ['Gelato Coco (M)',              'ice cream',290, 4,  32, 16, ['dessert']],
  ['Sorbet Fraise (M)',            'ice cream',150, 1,  37, 0,  ['dessert','vegan']],
  ['Sorbet Citron (M)',            'ice cream',145, 1,  36, 0,  ['dessert','vegan']],
  ['Sorbet Mangue (M)',            'ice cream',155, 1,  38, 0,  ['dessert','vegan']],
  ['Sorbet Framboise (M)',         'ice cream',145, 1,  35, 0,  ['dessert','vegan']],
  ['Sorbet Cassis (M)',            'ice cream',150, 1,  36, 0,  ['dessert','vegan']],
  ['Sorbet Passion (M)',           'ice cream',155, 1,  37, 0,  ['dessert','vegan']],
  ['Sorbet Poire (M)',             'ice cream',150, 1,  37, 0,  ['dessert','vegan']],
  ['Sorbet Pomme Verte (M)',       'ice cream',145, 1,  36, 0,  ['dessert','vegan']],
  ['Sorbet Mojito (M)',            'ice cream',155, 1,  38, 0,  ['dessert','vegan']],
  ['Gelato Piccola (S, ~80g)',     'ice cream',180, 3,  21, 9,  ['dessert']],
  ['Gelato Grande (L, ~160g)',     'ice cream',365, 5,  43, 18, ['dessert']],
  // Crêpes
  ['Crêpe Nutella',                'crepe',   430, 8,  52, 20, ['dessert']],
  ['Crêpe Sucre',                  'crepe',   245, 6,  35, 9,  ['dessert']],
  ['Crêpe Citron',                 'crepe',   255, 6,  40, 8,  ['dessert']],
  ['Crêpe Confiture',              'crepe',   295, 6,  46, 9,  ['dessert']],
  ['Crêpe Banane Nutella',         'crepe',   485, 9,  62, 22, ['dessert']],
  ['Crêpe Pistache Glace',         'crepe',   495, 9,  58, 24, ['dessert']],
  // Gaufres
  ['Gaufre Sucre',                 'dessert', 320, 7,  46, 12, ['dessert']],
  ['Gaufre Nutella',               'dessert', 480, 9,  58, 23, ['dessert']],
  ['Gaufre Glace Vanille',         'dessert', 510, 10, 60, 24, ['dessert']],
  ['Gaufre Fruits Frais',          'dessert', 365, 8,  52, 13, ['dessert']],
  // Granitas / drinks
  ['Granita Citron',               'drink',   135, 0,  34, 0,  ['dessert']],
  ['Granita Café',                 'drink',   125, 1,  30, 0,  ['dessert']],
  ['Granita Fraise',               'drink',   130, 0,  33, 0,  ['dessert']],
  ['Milkshake Vanille',            'drink',   355, 9,  52, 13, ['dessert']],
  ['Milkshake Chocolat',           'drink',   395, 10, 58, 14, ['dessert']],
  ['Milkshake Pistache',           'drink',   410, 10, 56, 17, ['dessert']],
  // Hot
  ['Chocolat Chaud Italien',       'drink',   295, 8,  38, 12, ['dessert']],
  ['Affogato',                     'dessert', 235, 4,  26, 12, ['dessert']],
];

// ============================== Build & merge ==============================
const sets = [
  { brand: "McDonald's France", prefix: 'mcdo', rows: MCDO },
  { brand: 'Burger King France', prefix: 'bk',  rows: BK },
  { brand: 'KFC France',         prefix: 'kfc', rows: KFC },
  { brand: 'Quick',              prefix: 'quick', rows: QUICK },
  { brand: "O'Tacos",            prefix: 'otacos', rows: OTACOS },
  { brand: 'Chicken Street',     prefix: 'cs',  rows: CHICKENSTREET },
  { brand: 'Peppe Chicken',      prefix: 'pepe', rows: PEPE },
  { brand: 'Subway France',      prefix: 'sub', rows: SUBWAY },
  { brand: 'Paul',               prefix: 'paul', rows: PAUL },
  { brand: 'Matsuri',            prefix: 'matsuri', rows: MATSURI },
  { brand: 'Le Louchebem',       prefix: 'louchebem', rows: LOUCHEBEM },
  { brand: 'Amorino',            prefix: 'amorino', rows: AMORINO },
];

const brandsToReplace = new Set([...sets.map(s => s.brand), 'Boulangerie Paul']);
const kept = existing.filter(e => !brandsToReplace.has(e.brand));

const newEntries = sets.flatMap(s => makeEntries(s.brand, s.prefix, s.rows));
const merged = [...kept, ...newEntries];

const out = 'module.exports = ' + JSON.stringify(merged, null, 2) + ';\n';
fs.writeFileSync(DATA_PATH, out);

console.log(`Wrote ${merged.length} total France entries.`);
console.log(`  Kept (other brands): ${kept.length}`);
sets.forEach(s => {
  const n = newEntries.filter(e => e.brand === s.brand).length;
  console.log(`  ${s.brand.padEnd(22)} ${n}`);
});
