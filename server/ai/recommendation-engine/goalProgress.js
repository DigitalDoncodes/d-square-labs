const Recommendation = require('../../models/Recommendation');
const UserMemory = require('../../models/UserMemory');

const GOAL_REC_TYPE_MAP = {
  'placement': ['placement-readiness', 'resume-suggestion', 'interview-suggestion', 'deadline-alert'],
  'skill-building': ['study-session', 'weak-topic-alert', 'focus'],
  'task-management': ['priority', 'deadline-alert', 'planner-suggestion'],
  'career-planning': ['planner-suggestion', 'placement-readiness', 'resume-suggestion'],
  'wellness': ['wellness-suggestion'],
  'learning': ['ai-action', 'study-session', 'weak-topic-alert'],
  'general': [],
};

async function compute(userId) {
  const [memory, completedRecs, activeRecs] = await Promise.all([
    UserMemory.findOne({ user: userId }).lean(),
    Recommendation.find({
      user: userId,
      'lifecycle.state': 'completed',
    }).sort({ updatedAt: -1 }).lean(),
    Recommendation.find({
      user: userId,
      'lifecycle.state': { $in: ['generated', 'seen', 'accepted', 'started'] },
    }).lean(),
  ]);

  const goals = memory?.careerInterests?.length
    ? memory.careerInterests.map((g) => ({ name: g, type: 'career' }))
    : [{ name: 'general', type: 'default' }];

  const totalRecs = completedRecs.length + activeRecs.length;
  const completedCount = completedRecs.length;

  const goalProgressItems = goals.map((goal) => {
    const goalKey = goal.name.toLowerCase().replace(/\s+/g, '-');
    const relevantTypes = GOAL_REC_TYPE_MAP[goalKey] || [];
    if (!relevantTypes.length) {
      return {
        goal: goal.name,
        type: goal.type,
        completionPct: totalRecs > 0 ? Math.round((completedCount / totalRecs) * 100) : 0,
        completed: completedCount,
        total: totalRecs,
        milestones: [],
        estimatedDaysRemaining: null,
      };
    }

    const goalCompleted = completedRecs.filter((r) => relevantTypes.includes(r.type)).length;
    const goalActive = activeRecs.filter((r) => relevantTypes.includes(r.type)).length;
    const goalTotal = goalCompleted + goalActive;

    const milestones = _computeMilestones(goal, goalCompleted);

    const ratePerDay = _computeRate(completedRecs);
    const estimatedDaysRemaining = ratePerDay > 0 && goalActive > 0
      ? Math.ceil(goalActive / ratePerDay)
      : null;

    return {
      goal: goal.name,
      type: goal.type,
      completionPct: goalTotal > 0 ? Math.round((goalCompleted / goalTotal) * 100) : 0,
      completed: goalCompleted,
      total: goalTotal,
      milestones,
      estimatedDaysRemaining,
    };
  });

  const allMilestones = goalProgressItems.flatMap((g) => g.milestones);

  return {
    goals: goalProgressItems,
    overall: {
      completionPct: totalRecs > 0 ? Math.round((completedCount / totalRecs) * 100) : 0,
      totalCompleted: completedCount,
      totalActive: activeRecs.length,
    },
    milestones: allMilestones,
  };
}

function _computeMilestones(goal, completed) {
  const milestones = [
    { label: 'Getting started', threshold: 0, reached: completed >= 0 },
    { label: 'Building momentum', threshold: 3, reached: completed >= 3 },
    { label: 'Making progress', threshold: 6, reached: completed >= 6 },
    { label: 'Halfway there', threshold: 10, reached: completed >= 10 },
    { label: 'Strong foundation', threshold: 15, reached: completed >= 15 },
    { label: 'Goal achieved', threshold: 20, reached: completed >= 20 },
  ];

  const nextMilestone = milestones.find((m) => !m.reached);

  return {
    reached: milestones.filter((m) => m.reached).map((m) => m.label),
    next: nextMilestone?.label || 'All milestones reached',
    progressToNext: nextMilestone
      ? Math.round(((completed - nextMilestone.threshold) / (nextMilestone.threshold + 3)) * 100)
      : 100,
  };
}

function _computeRate(completedRecs) {
  if (completedRecs.length < 2) return 0;
  const oldest = new Date(completedRecs[completedRecs.length - 1].updatedAt).getTime();
  const newest = new Date(completedRecs[0].updatedAt).getTime();
  const daysSpan = (newest - oldest) / (1000 * 60 * 60 * 24);
  if (daysSpan < 1) return completedRecs.length;
  return Math.round((completedRecs.length / daysSpan) * 10) / 10;
}

module.exports = { compute };
