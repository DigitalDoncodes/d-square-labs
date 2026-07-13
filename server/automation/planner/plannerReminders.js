/**
 * Planner due-date reminders.
 * Runs daily at 8am — notifies task assignee and creator when a task
 * is due within the next 24 hours and hasn't been completed.
 */
const Task = require('../../models/Task');
const { notify } = require('../../controllers/notificationController');

async function sendPlannerReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await Task.find({
    dueDate: { $gte: now, $lte: in24h },
    status: { $nin: ['done', 'completed'] },
  }).lean();

  if (!tasks.length) return;

  const notified = new Set(); // avoid duplicate notifs for same user+task

  for (const task of tasks) {
    const dueFmt = new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const recipients = [];
    if (task.assignee) recipients.push(String(task.assignee));
    if (task.createdBy && !recipients.includes(String(task.createdBy))) recipients.push(String(task.createdBy));

    for (const uid of recipients) {
      const key = `${uid}:${task._id}`;
      if (notified.has(key)) continue;
      notified.add(key);
      await notify({
        user: uid,
        type: 'general',
        title: `Task due soon: ${task.title}`,
        body: `Due ${dueFmt}`,
        link: '/me/planner',
      }).catch(() => {});
    }
  }

  console.log(`[planner-reminders] Sent reminders for ${tasks.length} task(s)`);
}

module.exports = { sendPlannerReminders };
