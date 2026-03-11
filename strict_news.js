const RSSParser = require('rss-parser');
const parser = new RSSParser();
const fs = require('fs');

async function fetchStrictFmcg() {
  const feeds = [
    'https://news.google.com/rss/search?q=Lebanon+(restaurant+OR+supermarket+OR+food+OR+FMCG+OR+Spinneys+OR+Carrefour)&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=Liban+(restaurant+OR+supermarch%C3%A9+OR+alimentation+OR+Spinneys+OR+Carrefour)&hl=fr&gl=FR&ceid=FR:fr',
    'https://www.lorientlejour.com/rss/category/Economie'
  ];

  let allItems = [];
  const bannedWords = ['war', 'israel', 'strike', 'missile', 'hezbollah', 'politics', 'government', 'parliament', 'injured', 'killed', 'conflict', 'evacuate', 'mourn', 'gulf', 'iran', 'crisis', 'airstrike', 'military', 'army', 'death', 'casualty', 'bomb', 'drone', 'attack', 'protest', 'gaza', 'palestine', 'assassination', 'politician'];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      allItems.push(...feed.items);
    } catch(e) {
      console.error('Failed to fetch', feedUrl);
    }
  }

  // Filter 
  const filtered = allItems.filter(item => {
    const text = (item.title + ' ' + (item.contentSnippet || item.content || '')).toLowerCase();
    
    // Must NOT contain banned words
    if(bannedWords.some(bw => text.includes(bw))) return false;

    // Must contain food/restaurant/market/brand keywords
    const goodWords = ['food', 'restaurant', 'supermarket', 'market', 'fmcg', 'spinneys', 'carrefour', 'menu', 'chef', 'cuisine', 'dining', 'diet', 'grocery', 'retail', 'brand', 'eat', 'nourriture', 'supermarché', 'economie', 'business', 'startup', 'delivery', 'coffee', 'cafe'];
    
    const hasGood = goodWords.some(gw => text.includes(gw));
    const mentionsLebanon = text.includes('lebanon') || text.includes('liban') || text.includes('beirut') || text.includes('beyrouth');

    return hasGood && mentionsLebanon;
  });

  console.log(`Initial strict articles: ${filtered.length}`);

  // Sort and remove duplicates by title
  const deduplicated = [];
  const seenTitles = new Set();
  
  for(let it of filtered) {
      const norm = it.title.toLowerCase();
      if(!seenTitles.has(norm)) {
          seenTitles.add(norm);
          deduplicated.push({
              title: it.title,
              link: it.link,
              pubDate: new Date(it.pubDate || Date.now()).toISOString(),
              contentSnippet: (it.contentSnippet || it.content || '').replace(/<[^>]*>?/g, '').substring(0, 150) + "..."
          });
      }
  }
  
  // Sort by date
  deduplicated.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));

  fs.writeFileSync('strict_news.json', JSON.stringify(deduplicated, null, 2));
  console.log(`Saved ${deduplicated.length} strict items.`);
}

fetchStrictFmcg();
