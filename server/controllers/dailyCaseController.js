const DailyCase = require('../models/DailyCase');
const DailyCaseSolve = require('../models/DailyCaseSolve');
const { computeDailyCaseStreak } = require('../utils/streak');
const { todayKey } = require('../utils/quota');

// GET /api/daily-case/today — today's case (falls back to the most recent one
// so the widget never shows empty), whether the user solved it, and streak.
exports.getToday = async (req, res, next) => {
  try {
    let dailyCase = await DailyCase.findOne({ dateKey: todayKey() }).lean();
    if (!dailyCase) {
      dailyCase = await DailyCase.findOne({ dateKey: { $lt: todayKey() } })
        .sort({ dateKey: -1 })
        .lean();
    }
    if (!dailyCase) return res.json({ case: null, solved: false, streak: 0 });

    const solve = await DailyCaseSolve.findOne({ user: req.user.userId, dailyCase: dailyCase._id });
    const streak = await computeDailyCaseStreak(req.user.userId);
    if (!solve) delete dailyCase.framework;
    res.json({ case: dailyCase, solved: Boolean(solve), streak });
  } catch (err) {
    next(err);
  }
};

// POST /api/daily-case/:id/solve — mark worked-through, reveal the framework.
exports.solveCase = async (req, res, next) => {
  try {
    const dailyCase = await DailyCase.findById(req.params.id);
    if (!dailyCase) return res.status(404).json({ message: 'Case not found' });

    await DailyCaseSolve.updateOne(
      { user: req.user.userId, dailyCase: dailyCase._id },
      { $setOnInsert: { dateKey: dailyCase.dateKey } },
      { upsert: true }
    );
    const streak = await computeDailyCaseStreak(req.user.userId);
    res.json({ framework: dailyCase.framework || '', streak });
  } catch (err) {
    next(err);
  }
};

// Admin CRUD
exports.listCases = async (req, res, next) => {
  try {
    const cases = await DailyCase.find().sort({ dateKey: -1 }).limit(100);
    res.json(cases);
  } catch (err) {
    next(err);
  }
};

exports.createCase = async (req, res, next) => {
  try {
    const { dateKey, title, category, scenario, question, framework } = req.body;
    const created = await DailyCase.create({
      dateKey: dateKey || todayKey(),
      title,
      category,
      scenario,
      question,
      framework,
      createdBy: req.user.userId,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.updateCase = async (req, res, next) => {
  try {
    const { dateKey, title, category, scenario, question, framework } = req.body;
    const updated = await DailyCase.findByIdAndUpdate(
      req.params.id,
      { dateKey, title, category, scenario, question, framework },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Case not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteCase = async (req, res, next) => {
  try {
    const deleted = await DailyCase.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Case not found' });
    await DailyCaseSolve.deleteMany({ dailyCase: deleted._id });
    res.json({ message: 'Case deleted' });
  } catch (err) {
    next(err);
  }
};
