const HabitLog = require('../models/HabitLog');

const DEFAULT_HABITS = ['Study 2h', 'Review notes', 'Case study', 'Exercise', 'Read'];

const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.getTodayLog = async (req, res, next) => {
  try {
    let log = await HabitLog.findOne({ user: req.user.userId, date: todayDate() });
    if (!log) {
      log = await HabitLog.create({
        user: req.user.userId,
        date: todayDate(),
        habits: DEFAULT_HABITS.map((name) => ({ name, done: false })),
        studyMinutes: 0,
        pomodoroCount: 0,
      });
    }
    res.json(log);
  } catch (err) { next(err); }
};

exports.updateLog = async (req, res, next) => {
  try {
    const log = await HabitLog.findOneAndUpdate(
      { user: req.user.userId, date: todayDate() },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (err) { next(err); }
};

exports.getStreak = async (req, res, next) => {
  try {
    const logs = await HabitLog.find({ user: req.user.userId, studyMinutes: { $gt: 0 } })
      .sort({ date: -1 })
      .select('date');

    let streak = 0;
    const check = new Date();
    check.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diff = Math.round((check - logDate) / 86400000);
      if (diff === streak) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) { next(err); }
};

exports.getWeekStats = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const logs = await HabitLog.find({ user: req.user.userId, date: { $gte: since } }).sort({ date: 1 });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const log = logs.find((l) => new Date(l.date).toDateString() === d.toDateString());
      days.push({
        date: d.toISOString(),
        studyMinutes: log?.studyMinutes ?? 0,
        pomodoroCount: log?.pomodoroCount ?? 0,
      });
    }
    res.json({ days });
  } catch (err) { next(err); }
};
