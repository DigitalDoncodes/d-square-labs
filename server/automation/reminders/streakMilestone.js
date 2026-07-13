const User = require('../../models/User');
const DailyCaseSolve = require('../../models/DailyCaseSolve');
const { notify } = require('../../controllers/notificationController');

const MILESTONES = [7, 30, 60, 100];

function computeStreak(dateKeys) {
  const days = [...new Set(dateKeys)].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (days[i] === expected || (i === 0 && days[0] < today)) streak++;
    else break;
  }
  return streak;
}

async function checkStreakMilestones() {
  const today = new Date().toISOString().slice(0, 10);

  // Only check users who solved today's case
  const todaySolvers = await DailyCaseSolve.find({ dateKey: today }).distinct('user');
  if (!todaySolvers.length) return;

  let milestoneCount = 0;
  for (const userId of todaySolvers) {
    const solves = await DailyCaseSolve.find({ user: userId })
      .sort({ dateKey: -1 })
      .limit(120)
      .select('dateKey')
      .lean();
    const streak = computeStreak(solves.map((s) => s.dateKey));
    if (MILESTONES.includes(streak)) {
      await notify({ user: userId, type: 'milestone', title: `${streak}-day case streak! Keep it up`, body: 'Consistency is what separates good from great at placements', link: '/study' }).catch(() => {});
      milestoneCount++;
    }
  }
  console.log(`[streak-milestone] Milestone notifications sent: ${milestoneCount}`);
}

module.exports = { checkStreakMilestones };
