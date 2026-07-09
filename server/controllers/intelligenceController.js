const NewsItem = require('../models/NewsItem');
const MarketSnapshot = require('../models/MarketSnapshot');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');
const { refreshNews } = require('../services/newsFetcher');
const { refreshMarket } = require('../services/marketFetcher');

// ---- Live news (read) ----

exports.listArticles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const articles = await NewsItem.find(filter)
      .sort({ publishedAt: -1 })
      .limit(80)
      .lean();

    const bookmarks = await Bookmark.find({ user: req.user.userId }).select('article').lean();
    const saved = new Set(bookmarks.map((b) => b.article.toString()));
    res.json(articles.map((a) => ({ ...a, bookmarked: saved.has(a._id.toString()) })));
  } catch (err) {
    next(err);
  }
};

exports.listBookmarked = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.userId })
      .populate('article')
      .sort({ createdAt: -1 })
      .lean();
    const articles = bookmarks.filter((b) => b.article).map((b) => ({ ...b.article, bookmarked: true }));
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const existing = await Bookmark.findOne({ user: req.user.userId, article: req.params.id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ bookmarked: false });
    }
    await Bookmark.create({ user: req.user.userId, article: req.params.id });
    res.json({ bookmarked: true });
  } catch (err) {
    next(err);
  }
};

// Admin: force an immediate refresh of both news and market data.
exports.refresh = async (req, res, next) => {
  try {
    const [news, market] = await Promise.all([refreshNews(), refreshMarket()]);
    res.json({ ...news, market: market.live });
  } catch (err) {
    next(err);
  }
};

// ---- Interests (personalization) ----

exports.setInterests = async (req, res, next) => {
  try {
    const interests = Array.isArray(req.body.interests) ? req.body.interests.slice(0, 12) : [];
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { interests },
      { new: true, runValidators: true }
    ).select('interests');
    res.json({ interests: user.interests });
  } catch (err) {
    next(err);
  }
};

// ---- Market snapshot (admin-maintained) ----

exports.getMarket = async (req, res, next) => {
  try {
    const snapshot = await MarketSnapshot.findOne().sort({ updatedAt: -1 });
    res.json(snapshot || { indicators: [], updatedAt: null });
  } catch (err) {
    next(err);
  }
};
