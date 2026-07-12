const Resource = require('../models/Resource');
const cloudinary = require('../config/cloudinary');
const docUpload = require('../middleware/docUpload');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ title: re }, { professor: re }, { tags: re }];
    }
    const sort = req.query.sort === 'downloads' ? { downloads: -1 } : { createdAt: -1 };
    const resources = await Resource.find(filter).populate('uploadedBy', 'name').sort(sort);
    res.json(resources);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, subject, semester, professor, type, url, fileSize, tags } = req.body;
    if (!title || !url) return res.status(400).json({ message: 'Title and URL are required' });
    const resource = await Resource.create({
      title, subject, semester, professor, type, url, fileSize, tags: tags || [],
      uploadedBy: req.user.userId,
    });
    res.status(201).json(resource);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.uploadedBy.equals(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.uploadedBy.equals(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const { title, subject, semester, professor, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'datad/resources',
      resource_type: 'auto',
      public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-z0-9]/gi, '_')}`,
    });

    const fileType = docUpload.mimeToType[req.file.mimetype] || 'link';
    const fileSizeKB = Math.round(req.file.size / 1024);
    const fileSize = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;

    const resource = await Resource.create({
      title, subject, semester, professor,
      type: fileType,
      url: result.secure_url,
      fileSize,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      uploadedBy: req.user.userId,
    });
    res.status(201).json(resource);
  } catch (err) { next(err); }
};

exports.incrementDownload = async (req, res, next) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.json({ ok: true });
  } catch (err) { next(err); }
};
