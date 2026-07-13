const User = require('../../models/User');
const JournalEntry = require('../../models/JournalEntry');
const { notify } = require('../../controllers/notificationController');

async function sendJournalNudges() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const users = await User.find({ status: 'approved', role: { $ne: 'admin' } }).select('_id').lean();

  const usersWithRecentEntry = await JournalEntry.distinct('user', {
    entryDate: { $gte: threeDaysAgo },
  });

  const recentSet = new Set(usersWithRecentEntry.map(String));
  const toNudge = users.filter((u) => !recentSet.has(String(u._id)));

  for (const user of toNudge) {
    await notify({ user: user._id, type: 'general', title: "You haven't journaled in 3 days", body: 'Take 2 minutes to reflect — it helps more than you think', link: '/me/journal' }).catch(() => {});
  }

  console.log(`[journal-nudge] Nudged ${toNudge.length} user(s)`);
}

module.exports = { sendJournalNudges };
