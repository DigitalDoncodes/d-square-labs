const Internship = require('../models/Internship');

exports.list = async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.remote === 'true') filter.remote = true;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ title: re }, { company: re }, { tags: re }];
    }
    const internships = await Internship.find(filter)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, company, location, remote, stipend, duration, applyLink, deadline, eligibility, tags } = req.body;
    if (!title || !company || !applyLink) return res.status(400).json({ message: 'Title, company and apply link are required' });
    const internship = await Internship.create({
      title, company, location, remote, stipend, duration, applyLink, deadline, eligibility,
      tags: tags || [],
      postedBy: req.user.userId,
    });
    res.status(201).json(internship);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.postedBy.equals(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!item.postedBy.equals(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
