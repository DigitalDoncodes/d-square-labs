const Parser = require('rss-parser');

const parser = new Parser({ timeout: 8000 });

// In-memory cache: slug → { fetchedAt, articles }
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Reliable Indian business RSS feeds that carry company-specific news.
// Each URL accepts a query string so we can search by company name.
const buildFeedUrls = (query) => {
  const q = encodeURIComponent(query);
  return [
    {
      source: 'Economic Times',
      url: `https://economictimes.indiatimes.com/rssfeedstopstories.cms`,
      // ET's top stories feed; we filter client-side
    },
    {
      source: 'Moneycontrol',
      url: `https://www.moneycontrol.com/rss/MCtopnews.xml`,
    },
    {
      source: 'Business Standard',
      url: `https://www.business-standard.com/rss/home_page_top_stories.rss`,
    },
    {
      source: 'Livemint',
      url: `https://www.livemint.com/rss/companies`,
    },
    {
      source: 'Hindu BusinessLine',
      url: `https://www.thehindubusinessline.com/companies/feeder/default.rss`,
    },
    {
      source: 'Financial Express',
      url: `https://www.financialexpress.com/feed/`,
    },
  ];
};

const fetchFeed = async ({ source, url }) => {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item) => ({
      title: item.title?.trim() || '',
      link: item.link || item.guid || '',
      snippet: item.contentSnippet?.slice(0, 220) || item.content?.replace(/<[^>]+>/g, '').slice(0, 220) || '',
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      source,
    }));
  } catch {
    return [];
  }
};

// Score relevance: higher = more relevant to the company name.
const scoreArticle = (article, keywords) => {
  const haystack = `${article.title} ${article.snippet}`.toLowerCase();
  return keywords.reduce((s, kw) => s + (haystack.includes(kw) ? 1 : 0), 0);
};

exports.getCompanyNews = async (req, res, next) => {
  try {
    const { name } = req.query; // company name passed from client
    if (!name) return res.status(400).json({ message: 'name query param required' });

    const cacheKey = name.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return res.json(cached.articles);
    }

    const feedUrls = buildFeedUrls(name);
    const results = await Promise.allSettled(feedUrls.map(fetchFeed));
    const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

    // Build keyword set from company name (e.g. "Tata Consultancy" → ["tata", "consultancy", "tcs"])
    const words = name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    // Also include common abbreviations: first letters of each word
    const abbrev = words.map((w) => w[0]).join('');
    const keywords = [...new Set([...words, abbrev])];

    const relevant = all
      .map((a) => ({ ...a, _score: scoreArticle(a, keywords) }))
      .filter((a) => a._score > 0 && a.title && a.link)
      .sort((a, b) => {
        // Primary: relevance score; secondary: recency
        if (b._score !== a._score) return b._score - a._score;
        return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      })
      .slice(0, 12)
      .map(({ _score, ...rest }) => rest); // strip internal field

    cache.set(cacheKey, { fetchedAt: Date.now(), articles: relevant });
    res.json(relevant);
  } catch (err) {
    next(err);
  }
};
