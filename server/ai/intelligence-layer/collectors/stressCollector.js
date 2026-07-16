const Task = require('../../../models/Task');
const PlacementApplication = require('../../../models/PlacementApplication');

async function collect(userId) {
  try {
    const now = new Date();

    const [overdueTasks, upcomingTasks, applications] = await Promise.all([
      Task.find({ assignee: userId, status: 'pending', dueDate: { $lt: now } })
        .sort({ dueDate: 1 })
        .limit(10)
        .lean()
        .catch(() => []),
      Task.find({ assignee: userId, status: 'pending', dueDate: { $gte: now } })
        .sort({ dueDate: 1 })
        .limit(10)
        .lean()
        .catch(() => []),
      PlacementApplication.find({ user: userId }).lean().catch(() => []),
    ]);

    const indicators = [];

    if (overdueTasks.length > 3) indicators.push('multiple-overdue-tasks');
    if (overdueTasks.length > 0) {
      const daysOverdue = Math.round(
        (now - new Date(overdueTasks[0].dueDate)) / 86400000
      );
      if (daysOverdue > 3) indicators.push('severely-overdue');
    }

    const nearDeadlines = upcomingTasks.filter((t) => {
      const daysUntil = Math.ceil((new Date(t.dueDate) - now) / 86400000);
      return daysUntil >= 0 && daysUntil <= 2;
    });
    if (nearDeadlines.length > 2) indicators.push('multiple-near-deadlines');

    const pendingApps = applications.filter((a) => a.status === 'applied' || a.status === 'interview');
    if (pendingApps.length > 3) indicators.push('multiple-active-applications');
    const rejectedApps = applications.filter((a) => a.status === 'rejected');
    if (rejectedApps.length > 2) indicators.push('recent-rejections');

    const stressLevel = Math.min(100, Math.round(
      (overdueTasks.length * 15) +
      (nearDeadlines.length * 10) +
      (rejectedApps.length * 10)
    ));

    return {
      stressLevel,
      indicators,
      overdueCount: overdueTasks.length,
      nearDeadlineCount: nearDeadlines.length,
      pendingApplications: pendingApps.length,
      rejectedCount: rejectedApps.length,
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
