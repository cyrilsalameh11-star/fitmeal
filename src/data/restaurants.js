const france = require('./france_restaurants');
const spain = require('./spain_restaurants');
const lebanon = require('./lebanon_restaurants');
const usa = require('./usa_restaurants');
const uae = require('./uae_restaurants');
const ksa = require('./ksa_restaurants');
const qatar = require('./qatar_restaurants');

const restaurantMeals = [...france, ...spain, ...lebanon, ...usa, ...uae, ...ksa, ...qatar];

module.exports = restaurantMeals;