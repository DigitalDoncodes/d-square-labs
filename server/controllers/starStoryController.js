const StarStory = require('../models/StarStory');

exports.list = async (req, res, next) => {
  try {
    const stories = await StarStory.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, competency, situation, task, action, result, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const story = await StarStory.create({
      user: req.user.userId, title, competency, situation, task, action,
      result, tags: tags || [],
    });
    res.status(201).json(story);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const story = await StarStory.findOne({ _id: req.params.id, user: req.user.userId });
    if (!story) return res.status(404).json({ message: 'Story not found' });
    const fields = ['title', 'competency', 'situation', 'task', 'action', 'result', 'tags'];
    fields.forEach((f) => { if (req.body[f] !== undefined) story[f] = req.body[f]; });
    await story.save();
    res.json(story);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await StarStory.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ ok: true });
  } catch (err) { next(err); }
};
