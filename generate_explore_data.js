const fs = require('fs');
const path = require('path');

const generateItems = (brand, country, count, type) => {
  const items = [];
  const baseCal = type === 'dessert' ? 250 : type === 'supermarket' ? 100 : 300;
  
  for(let i=1; i<=count; i++) {
    items.push({
      id: `${brand.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${i}`,
      name: `${brand} item ${i}`,
      brand: brand,
      type: type === 'dessert' ? ['dessert', 'snack'] : type === 'supermarket' ? ['snack', 'lunch'] : ['lunch', 'dinner'],
      calories: baseCal + Math.floor(Math.random() * 300),
      protein: type === 'dessert' ? Math.floor(Math.random() * 8) : 10 + Math.floor(Math.random() * 30),
      carbs: 20 + Math.floor(Math.random() * 50),
      fat: 5 + Math.floor(Math.random() * 20),
      source: type === 'supermarket' ? 'supermarket' : 'restaurant',
      country: country,
      dietary: ['healthy']
    });
  }
  return items;
};

// Restaurants - need to update specific files since it uses requires
const lebanonRestPath = path.join(__dirname, 'src', 'data', 'lebanon_restaurants.js');
const franceRestPath = path.join(__dirname, 'src', 'data', 'france_restaurants.js');

let lebanon = require(lebanonRestPath);
let france = require(franceRestPath);

lebanon = [...lebanon, ...generateItems('Abdallah', 'Lebanon', 15, 'dessert')];
france = [...france, ...generateItems('Amorino', 'France', 15, 'dessert')];

fs.writeFileSync(lebanonRestPath, `module.exports = ${JSON.stringify(lebanon, null, 2)};`);
fs.writeFileSync(franceRestPath, `module.exports = ${JSON.stringify(france, null, 2)};`);

// Create UAE and KSA restaurant files
const uaeRest = [
  ...generateItems('Al Farooj', 'UAE', 15, 'restaurant'),
  ...generateItems("McDonald's UAE", 'UAE', 15, 'restaurant'),
  ...generateItems('KFC UAE', 'UAE', 15, 'restaurant')
];
const ksaRest = [
  ...generateItems('Al Baik', 'Saudi Arabia', 15, 'restaurant'),
  ...generateItems('Calo', 'Saudi Arabia', 15, 'restaurant'),
  ...generateItems('Kudu', 'Saudi Arabia', 15, 'restaurant')
];

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'uae_restaurants.js'), `module.exports = ${JSON.stringify(uaeRest, null, 2)};`);
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'ksa_restaurants.js'), `module.exports = ${JSON.stringify(ksaRest, null, 2)};`);

// Update index restaurants.js to include uae and ksa
const restIndexPath = path.join(__dirname, 'src', 'data', 'restaurants.js');
const restIndexContent = `
const france = require('./france_restaurants');
const spain = require('./spain_restaurants');
const lebanon = require('./lebanon_restaurants');
const usa = require('./usa_restaurants');
const uae = require('./uae_restaurants');
const ksa = require('./ksa_restaurants');

const restaurantMeals = [...france, ...spain, ...lebanon, ...usa, ...uae, ...ksa];

module.exports = restaurantMeals;
`;
fs.writeFileSync(restIndexPath, restIndexContent.trim());

// Supermarkets - update single file
const supPath = path.join(__dirname, 'src', 'data', 'supermarkets.js');
let sup = require(supPath);
const newSupermarkets = [
  ...generateItems('Spinneys Dubai', 'UAE', 30, 'supermarket'),
  ...generateItems('Carrefour UAE', 'UAE', 30, 'supermarket'),
  ...generateItems('Choithrams', 'UAE', 30, 'supermarket'),
  ...generateItems('Panda', 'Saudi Arabia', 30, 'supermarket'),
  ...generateItems('Tamimi Markets', 'Saudi Arabia', 30, 'supermarket'),
  ...generateItems('Al Raya', 'Saudi Arabia', 30, 'supermarket')
];
sup = [...sup, ...newSupermarkets];
fs.writeFileSync(supPath, `const supermarketMeals = ${JSON.stringify(sup, null, 2)};\n\nmodule.exports = supermarketMeals;`);

console.log('Data generation successful');
