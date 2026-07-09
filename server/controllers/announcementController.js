const Announcement = require('../models/Announcement');

// Read side for all members; create/delete live in adminController.
exports.listAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(20);
    res.json(announcements);
  } catch (err) {
    next(err);
  }
};
