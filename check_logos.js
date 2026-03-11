const https = require('https');

const logos = [
  'https://logo.clearbit.com/albaik.com',
  'https://logo.clearbit.com/tamimimarkets.com',
  'https://logo.clearbit.com/alraya.com.sa',
  'https://logo.clearbit.com/kudu.com.sa',
  'https://logo.clearbit.com/kfc.com',
  'https://logo.clearbit.com/alfarooj.com',
  'https://logo.clearbit.com/choithrams.com'
];

async function checkUrl(url) {
  return new Promise(resolve => {
    https.get(url, (res) => {
      resolve({url, status: res.statusCode});
    }).on('error', () => resolve({url, status: 'error'}));
  });
}

(async () => {
  for(let logo of logos) {
    const res = await checkUrl(logo);
    console.log(`${res.url} -> ${res.status}`);
  }
})();
