const fs = require('fs');
const https = require('https');

const url = 'https://www.lorientlejour.com/rss';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const items = [];
      const regex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>/g;
      let match;
      while ((match = regex.exec(data)) !== null && items.length < 25) {
        items.push({
          title: match[1],
          link: match[2],
          pubDate: new Date(match[3]).toISOString(),
          contentSnippet: match[4]
        });
      }
      fs.writeFileSync('real_news.json', JSON.stringify(items, null, 2));
      console.log(`Saved ${items.length} news items.`);
    } catch(e) {
      console.error(e);
    }
  });
}).on('error', (e) => console.error(e));
