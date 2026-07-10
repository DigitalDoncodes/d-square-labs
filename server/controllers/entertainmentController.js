const EntertainmentItem = require('../models/EntertainmentItem');
const Memory = require('../models/Memory');

const slugify = (str) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ---- Public (authenticated) reads ----

// List / search across categories and release decade.
exports.searchArchive = async (req, res, next) => {
  try {
    const { q, category, year } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { 'mainCharacters.name': { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (year) query.releaseYear = { $gte: Number(year), $lt: Number(year) + 10 };

    const results = await EntertainmentItem.find(query)
      .sort({ isThrowbackPick: -1, views: -1 })
      .limit(60)
      .lean();
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getItemBySlug = async (req, res, next) => {
  try {
    const item = await EntertainmentItem.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Memory not found in the archives.' });

    const memories = await Memory.find({ item: item._id })
      .populate('user', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const userId = req.user.userId;
    const payload = item.toObject({ virtuals: true });
    payload.liked = item.likedBy?.some((id) => id.equals(userId)) || false;
    payload.bookmarked = item.bookmarkedBy?.some((id) => id.equals(userId)) || false;
    delete payload.likedBy;
    delete payload.bookmarkedBy;

    res.json({ item: payload, memories, nostalgiaScore: item.nostalgiaScore });
  } catch (err) {
    next(err);
  }
};

// ---- Likes & bookmarks (authenticated toggles) ----

const toggleField = (arrayField, countField) => async (req, res, next) => {
  try {
    const item = await EntertainmentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Archive item not found' });

    const userId = req.user.userId;
    const has = item[arrayField].some((id) => id.equals(userId));
    if (has) {
      item[arrayField].pull(userId);
      item[countField] = Math.max(0, item[countField] - 1);
    } else {
      item[arrayField].push(userId);
      item[countField] += 1;
    }
    await item.save();
    res.json({
      active: !has,
      likes: item.likes,
      bookmarksCount: item.bookmarksCount,
      nostalgiaScore: item.nostalgiaScore,
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = toggleField('likedBy', 'likes');
exports.toggleBookmark = toggleField('bookmarkedBy', 'bookmarksCount');

// ---- Community memories (authenticated) ----

exports.addMemory = async (req, res, next) => {
  try {
    const item = await EntertainmentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Archive item not found' });

    const { title, story, afterSchoolRoutine, favouriteMoment } = req.body;
    if (!title || !story) return res.status(400).json({ message: 'Title and story are required' });

    const memory = await Memory.create({
      item: item._id,
      user: req.user.userId,
      title,
      story,
      afterSchoolRoutine,
      favouriteMoment,
    });
    const populated = await memory.populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// ---- Admin content management ----

exports.createItem = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) body.slug = slugify(body.title);

    const existing = await EntertainmentItem.findOne({ slug: body.slug });
    if (existing) return res.status(409).json({ message: 'An item with this title/slug already exists' });

    const item = await EntertainmentItem.create(body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const body = { ...req.body };
    delete body.slug; // slug is immutable once created (keeps URLs stable)
    const item = await EntertainmentItem.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Archive item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await EntertainmentItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Archive item not found' });
    await Memory.deleteMany({ item: item._id });
    res.json({ message: 'Archive item deleted' });
  } catch (err) {
    next(err);
  }
};
