const ContentItem = require('../models/ContentItem');
const cloudinary = require('../config/cloudinary');
const registry = require('../services/publishing/destinationRegistry');
const ingestService = require('../services/publishing/ingestService');
const analysisService = require('../services/publishing/analysisService');
const publishService = require('../services/publishing/publishService');

const POPULATE_DUP = { path: 'duplicateOf', select: 'meta.title analysis.title file status destination' };

exports.upload = async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files provided' });
    const items = [];
    for (const file of req.files) {
      items.push(await ingestService.ingestFile(file, req.user));
    }
    res.status(201).json(items);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    if (req.query.destination) filter['destination.key'] = req.query.destination;
    if (req.query.search) filter.$text = { $search: req.query.search };
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const [items, total] = await Promise.all([
      ContentItem.find(filter)
        .populate('createdBy', 'name')
        .populate(POPULATE_DUP)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContentItem.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const item = await ContentItem.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate(POPULATE_DUP);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await ContentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.status === 'published') {
      return res.status(400).json({ message: 'Published items cannot be edited' });
    }
    const { meta, destinationKey } = req.body;
    if (meta) item.meta = { ...item.meta.toObject?.() ?? item.meta, ...meta };
    if (destinationKey) {
      item.destination = {
        key: destinationKey,
        targetModel: registry.get(destinationKey).model,
      };
    }
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.publish = async (req, res, next) => {
  try {
    const item = await ContentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    const { item: published } = await publishService.publish(item, req.user, {
      resolution: req.body?.resolution, // replace | version | undefined
    });
    res.json(published);
  } catch (err) { next(err); }
};

exports.draft = async (req, res, next) => {
  try {
    const item = await ContentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.status === 'published') {
      return res.status(400).json({ message: 'Already published' });
    }
    item.status = 'draft';
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.schedule = async (req, res, next) => {
  try {
    const when = new Date(req.body?.scheduledFor);
    if (!req.body?.scheduledFor || Number.isNaN(when.getTime()) || when <= new Date()) {
      return res.status(400).json({ message: 'scheduledFor must be a future date' });
    }
    const item = await ContentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.status === 'published') {
      return res.status(400).json({ message: 'Already published' });
    }
    if (!item.destination?.key) {
      return res.status(400).json({ message: 'Select a destination before scheduling' });
    }
    item.status = 'scheduled';
    item.scheduledFor = when;
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.reanalyze = async (req, res, next) => {
  try {
    const item = await ContentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.status === 'published') {
      return res.status(400).json({ message: 'Already published' });
    }
    // The upload buffer is gone; re-fetch the asset from Cloudinary.
    setImmediate(async () => {
      let buffer = null;
      try {
        const r = await fetch(item.file.url);
        if (r.ok) buffer = Buffer.from(await r.arrayBuffer());
      } catch (err) {
        console.warn(`[studio:reanalyze] could not re-fetch file: ${err.message}`);
      }
      analysisService.analyze(item._id, buffer);
    });
    item.status = 'analyzing';
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await ContentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.status === 'published') {
      return res.status(400).json({ message: 'Unpublish is not supported; manage the live record in its module' });
    }
    // Keep the DB record for audit; delete the stored asset.
    if (item.file?.publicId) {
      cloudinary.uploader
        .destroy(item.file.publicId, { resource_type: item.file.resourceType || 'raw' })
        .catch((err) => console.warn(`[studio] asset delete failed: ${err.message}`));
    }
    item.status = 'rejected';
    item.rejectedReason = req.body?.reason || 'Cancelled by admin';
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.destinations = (req, res) => {
  res.json(registry.catalog());
};
