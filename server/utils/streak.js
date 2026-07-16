const DailyCaseSolve = require('../models/DailyCaseSolve');

const todayKey = () => new Date().toISOString().slice(0, 10);

exports.computeDailyCaseStreak = async (userId) => {
  const solves = await DailyCaseSolve.find({ user: userId })
    .sort({ dateKey: -1 })
    .limit(120)
    .select('dateKey')
    .lean();
  const days = [...new Set(solves.map((s) => s.dateKey))];
  let streak = 0;
  const cursor = new Date();
  if (days[0] !== cursor.toISOString().slice(0, 10)) cursor.setDate(cursor.getDate() - 1);
  for (const day of days) {
    if (day !== cursor.toISOString().slice(0, 10)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
