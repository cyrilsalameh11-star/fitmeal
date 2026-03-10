const fs = require('fs');
const https = require('https');
const metadata = fs.readFileSync('frontend/src/data/metadata.js', 'utf8');

// Regex to find all logo URLs
const regex = /logo:\s*"(https:\/\/logo\.clearbit\.com\/[^"]+)"/g;
let match;
const urlSet = [];

while ((match = regex.exec(metadata)) !== null) {
    urlSet.push(match[1]);
}

// Deduplicate
const urls = [...new Set(urlSet)];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            let buf = Buffer.alloc(0);
            res.on('data', chunk => { buf = Buffer.concat([buf, chunk]); });
            res.on('end', () => {
                // Clearbit returns a 1x1 transparent GIF for missing logos (around 49 bytes)
                const isMissing = buf.length < 500;
                resolve({ url, status: res.statusCode, size: buf.length, missing: res.statusCode !== 200 || isMissing });
            });
        });
        req.on('error', () => resolve({ url, status: 'error', size: 0, missing: true }));
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ url, status: 'timeout', size: 0, missing: true });
        });
    });
}

async function run() {
    console.log(`Checking ${urls.length} unique Clearbit URLs...`);
    const results = await Promise.all(urls.map(checkUrl));

    const good = results.filter(r => !r.missing);
    const bad = results.filter(r => r.missing);

    console.log('\n✅ GOOD LOGOS:');
    good.forEach(r => console.log(`  [${r.status}] ${r.size}b ${r.url}`));

    console.log('\n❌ MISSING/BROKEN LOGOS (fallbacks needed):');
    bad.forEach(r => console.log(`  [${r.status}] ${r.size}b ${r.url}`));
}

run();
