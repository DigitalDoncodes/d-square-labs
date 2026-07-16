const HabitLog = require('../../../models/HabitLog');
const DailyCaseSolve = require('../../../models/DailyCaseSolve');
const { computeDailyCaseStreak } = require('../../../utils/streak');
const UserMemory = require('../../../models/UserMemory');
const Task = require('../../../models/Task');

async function collect(userId) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);

    const [habitLogs, caseSolves, userMemory, allTasks, streak] = await Promise.all([
      HabitLog.find({ user: userId, date: { $gte: weekAgo } })
        .sort({ date: -1 })
        .lean()
        .catch(() => []),
      DailyCaseSolve.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()
        .catch(() => []),
      UserMemory.findOne({ user: userId }).lean().catch(() => null),
      Task.find({ assignee: userId }).lean().catch(() => []),
      computeDailyCaseStreak(userId).catch(() => 0),
    ]);

    const todayHabit = habitLogs.find((h) => {
      const hDate = new Date(h.date);
      return hDate.toDateString() === todayStart.toDateString();
    });

    const totalStudyMin = habitLogs.reduce((sum, h) => sum + (h.studyMinutes || 0), 0);
    const avgStudyMin = habitLogs.length ? Math.round(totalStudyMin / habitLogs.length) : 0;

    const daysWithStudy = habitLogs.filter((h) => (h.studyMinutes || 0) > 0).length;
    const consistency = habitLogs.length ? Math.round((daysWithStudy / habitLogs.length) * 100) : 0;

    const totalPomodoros = habitLogs.reduce((sum, h) => sum + (h.pomodoroCount || 0), 0);

    const solvedCaseCount = caseSolves.length;
    const caseCategories = {};
    for (const s of caseSolves) {
      const dateKey = s.dateKey;
      caseCategories[dateKey] = (caseCategories[dateKey] || 0) + 1;
    }

    const weakTopics = userMemory?.weaknesses || [];
    const strongTopics = userMemory?.strengths || [];
    const recentTopics = userMemory?.recentTopics || [];

    const completedTasks = allTasks.filter((t) => t.status === 'done');
    const tasksCompleted7d = completedTasks.filter((t) => {
      return t.updatedAt && new Date(t.updatedAt) >= weekAgo;
    }).length;

    return {
      streak,
      solvedCaseCount,
      caseCategories,
      studyMinutes: totalStudyMin,
      avgStudyMinutes: avgStudyMin,
      todayStudyMinutes: todayHabit?.studyMinutes || 0,
      pomodoroCount: totalPomodoros,
      consistency,
      daysTracked: habitLogs.length,
      weakTopics,
      strongTopics,
      recentTopics,
      tasksCompleted7d,
      hasTodayHabit: !!todayHabit,
      lastActivity: caseSolves[0]?.createdAt || habitLogs[0]?.date || null,
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
