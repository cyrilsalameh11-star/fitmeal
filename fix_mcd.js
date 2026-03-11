const fs = require('fs');
let content = fs.readFileSync('src/data/uae_restaurants.js', 'utf8');
const list = [
    'McArabia Chicken', 'Spicy McChicken', 'Chicken Mac', 'Double Cheeseburger', 'Big Tasty',
    'Filet-O-Fish', 'Chicken McNuggets (9 pcs)', 'Grand Chicken Spicy', 'Fries (Large)', 'Apple Pie',
    'McFlurry Oreo', 'Spicy Chicken Burger', 'McWrap Chicken Sweet Chilli', 'Halloumi Muffin', 'Hash Browns'
];
content = content.replace(/"name":\s*"McDonald's UAE item (\d+)"/g, (m, idx) => {
    return `"name": "${list[(parseInt(idx) - 1) % list.length]}"`;
});
fs.writeFileSync('src/data/uae_restaurants.js', content);
console.log('Fixed McDonalds');
