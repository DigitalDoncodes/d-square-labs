const Task = require('../../../models/Task');

async function collect(userId) {
  try {
    const now = new Date();
    const allTasks = await Task.find({ assignee: userId })
      .sort({ dueDate: 1 })
      .limit(50)
      .lean()
      .catch(() => []);

    if (!allTasks.length) {
      return { total: 0, pending: 0, overdue: 0, completed: 0, upcomingDeadlines: [] };
    }

    const pending = allTasks.filter((t) => t.status === 'pending');
    const inProgress = allTasks.filter((t) => t.status === 'in-progress');
    const done = allTasks.filter((t) => t.status === 'done');
    const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < now);
    const upcomingDeadlines = pending
      .filter((t) => t.dueDate && new Date(t.dueDate) >= now)
      .slice(0, 5)
      .map((t) => ({ title: t.title, dueDate: t.dueDate, type: t.type, subject: t.subject }));

    const types = {};
    for (const t of pending) {
      types[t.type] = (types[t.type] || 0) + 1;
    }

    return {
      total: allTasks.length,
      pending: pending.length,
      inProgress: inProgress.length,
      completed: done.length,
      overdue: overdue.length,
      upcomingDeadlines,
      taskTypes: types,
      nextDeadline: pending.length ? pending[0].dueDate : null,
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
