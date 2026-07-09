const User = require('../models/User');
const Note = require('../models/Note');
const Photo = require('../models/Photo');
const Task = require('../models/Task');
const JournalEntry = require('../models/JournalEntry');
const Announcement = require('../models/Announcement');
const { sendAnnouncementEmail } = require('../config/mailer');

// ---- Overview ----

exports.getStats = async (req, res, next) => {
  try {
    const [students, notes, photos, tasks, journalEntries] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Photo.countDocuments(),
      Task.countDocuments(),
      JournalEntry.countDocuments({ user: req.user.userId }),
    ]);
    res.json({ students, notes, photos, tasks, journalEntries });
  } catch (err) {
    next(err);
  }
};

exports.listStudents = async (req, res, next) => {
  try {
    const students = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// ---- Journal (admin's private diary) ----

exports.listJournal = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.userId }).sort({ entryDate: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

exports.createJournalEntry = async (req, res, next) => {
  try {
    const { title, content, mood, entryDate } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    const entry = await JournalEntry.create({
      title,
      content,
      mood,
      entryDate: entryDate || Date.now(),
      user: req.user.userId,
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

exports.updateJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    const { title, content, mood, entryDate } = req.body;
    const updates = { title, content, mood, entryDate };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) entry[key] = value;
    }
    await entry.save();
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

exports.deleteJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    await entry.deleteOne();
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
};

// ---- Announcements ----

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, priority, pinned, sendEmail } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    const announcement = await Announcement.create({
      title,
      body,
      priority,
      pinned: Boolean(pinned),
      createdBy: req.user.userId,
    });
    if (sendEmail) {
      const recipients = await User.find({ role: { $ne: 'admin' } }).select('name email');
      if (recipients.length) {
        try {
          await sendAnnouncementEmail(recipients, announcement);
          announcement.emailed = true;
          await announcement.save();
        } catch (err) {
          console.error('Announcement email failed:', err.message);
        }
      }
    }
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
};
