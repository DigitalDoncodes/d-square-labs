const Album = require('../models/Album');
const Photo = require('../models/Photo');
const cloudinary = require('../config/cloudinary');

exports.listAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    const counts = await Photo.aggregate([
      { $group: { _id: '$album', count: { $sum: 1 }, cover: { $first: '$url' } } },
    ]);
    const byAlbum = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));
    res.json(
      albums.map((a) => ({
        ...a,
        photoCount: byAlbum[a._id.toString()]?.count || 0,
        coverUrl: byAlbum[a._id.toString()]?.cover || null,
      }))
    );
  } catch (err) {
    next(err);
  }
};

exports.getAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id).populate('createdBy', 'name');
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (err) {
    next(err);
  }
};

exports.createAlbum = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const album = await Album.create({ title, description, createdBy: req.user.userId });
    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
};

exports.deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    if (!album.createdBy.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only the creator can delete this album' });
    }
    const photos = await Photo.find({ album: album._id });
    for (const photo of photos) {
      await cloudinary.uploader.destroy(photo.publicId);
    }
    await Photo.deleteMany({ album: album._id });
    await album.deleteOne();
    res.json({ message: 'Album deleted' });
  } catch (err) {
    next(err);
  }
};

exports.listAlbumPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ album: req.params.id })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    next(err);
  }
};
