const Note = require('../models/Note');
const publishService = require('../services/publishing/publishService');

exports.listNotes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    const notes = await Note.find(filter)
      .populate('author', 'name')
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('author', 'name');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    next(err);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const { title, subject, semester, content } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }
    // Record creation goes through the central publishing engine; the
    // verbatim content is passed via extra so it is stored unmodified.
    const { target: note } = await publishService.publishDirect({
      destinationKey: 'notes',
      meta: {
        title,
        subject,
        semester,
        description: (content || '').slice(0, 2000),
        extra: { content: content || '' },
      },
      user: req.user,
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.author.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only the author can edit this note' });
    }
    const { title, subject, semester, content } = req.body;
    Object.assign(note, { title, subject, semester, content });
    await note.save();
    res.json(note);
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.author.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only the author can delete this note' });
    }
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};
