const crypto = require('crypto');
const Photo = require('../models/Photo');
const Album = require('../models/Album');
const cloudinary = require('../config/cloudinary');
const publishService = require('../services/publishing/publishService');

exports.uploadPhoto = async (req, res, next) => {
  try {
    const { albumId, caption } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'datad/photos',
    });

    // Record creation goes through the central publishing engine.
    const { target: photo } = await publishService.publishDirect({
      file: {
        originalName: req.file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        mime: req.file.mimetype,
        type: 'image',
        size: req.file.size,
        hash: crypto.createHash('sha256').update(req.file.buffer).digest('hex'),
      },
      destinationKey: 'gallery',
      meta: {
        title: caption || req.file.originalname,
        extra: { albumId, caption: caption || '' },
      },
      user: req.user,
    });
    res.status(201).json(photo);
  } catch (err) {
    next(err);
  }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    if (!photo.uploadedBy.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only the uploader can delete this photo' });
    }
    await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
};

exports.listRecentPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(photos);
  } catch (err) {
    next(err);
  }
};
