const fs = require('fs');
let f = fs.readFileSync('frontend/src/data/metadata.js', 'utf8');
f = f.replace(/https:\/\/www\.google\.com\/s2\/favicons\?domain=([^&]+)&sz=64/g, 'https://logo.clearbit.com/$1');
fs.writeFileSync('frontend/src/data/metadata.js', f);
console.log('Replaced URLs');
