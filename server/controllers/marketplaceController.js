const MarketListing = require('../models/MarketListing');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.showSold !== 'true') filter.sold = false;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ title: re }, { description: re }, { tags: re }];
    }
    const listings = await MarketListing.find(filter)
      .populate('seller', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, price, category, condition, images, contact, tags } = req.body;
    if (!title || price === undefined) return res.status(400).json({ message: 'Title and price are required' });
    const listing = await MarketListing.create({
      title, description, price, category, condition,
      images: images || [], contact, tags: tags || [],
      seller: req.user.userId,
    });
    res.status(201).json(listing);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await MarketListing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.seller.equals(req.user.userId)) return res.status(403).json({ message: 'Not authorised' });
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await MarketListing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.seller.equals(req.user.userId)) return res.status(403).json({ message: 'Not authorised' });
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.markSold = async (req, res, next) => {
  try {
    const item = await MarketListing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.seller.equals(req.user.userId)) return res.status(403).json({ message: 'Not authorised' });
    item.sold = true;
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};
