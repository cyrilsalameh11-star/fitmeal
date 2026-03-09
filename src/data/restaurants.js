const france = require('./france_restaurants');
const spain = require('./spain_restaurants');
const lebanon = require('./lebanon_restaurants');
const usa = require('./usa_restaurants');

const restaurantMeals = [...france, ...spain, ...lebanon, ...usa];

module.exports = restaurantMeals;
