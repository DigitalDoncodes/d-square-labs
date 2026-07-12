const JournalEntry = require('../models/JournalEntry');

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
