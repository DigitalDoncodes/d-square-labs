const { createRecommendation } = require('./recommendationFactory');

const CONFLICT_GROUPS = {
  'study-session': ['ai-action'],
  'priority': ['focus'],
  'placement-readiness': ['resume-suggestion', 'interview-suggestion'],
};

const MERGEABLE_TYPES = {
  'deadline-alert': 'priority',
  'weak-topic-alert': 'study-session',
};

const MAX_DAILY_RECOMMENDATIONS = 12;

function plan(recommendations, profile) {
  let recs = [...recommendations];
  recs = deduplicate(recs);
  recs = resolveConflicts(recs, profile);
  recs = mergeSimilar(recs);
  recs = prioritizeByGoals(recs, profile);
  recs = assignPlanOrder(recs);

  return recs;
}

function deduplicate(recs) {
  const seen = new Set();
  return recs.filter((r) => {
    const key = `${r.type}:${r.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveConflicts(recs, _profile) {
  const keep = [];
  const removed = new Set();

  const grouped = {};
  for (const r of recs) {
    const group = CONFLICT_GROUPS[r.type];
    if (group) {
      for (const conflictType of group) {
        if (!grouped[conflictType]) grouped[conflictType] = [];
        grouped[conflictType].push(r);
      }
    }
  }

  for (const [type, conflicting] of Object.entries(grouped)) {
    if (conflicting.length < 2) continue;
    const sorted = conflicting.sort((a, b) => b.urgency - a.urgency);
    for (let i = 1; i < sorted.length; i++) {
      removed.add(sorted[i]);
    }
  }

  for (const r of recs) {
    if (!removed.has(r)) keep.push(r);
  }

  return keep;
}

function mergeSimilar(recs) {
  const merged = [];
  const groups = {};

  for (const r of recs) {
    const targetType = MERGEABLE_TYPES[r.type];
    if (targetType) {
      if (!groups[targetType]) groups[targetType] = [];
      groups[targetType].push(r);
    } else {
      merged.push(r);
    }
  }

  for (const [targetType, mergeCandidates] of Object.entries(groups)) {
    if (mergeCandidates.length <= 1) {
      merged.push(...mergeCandidates);
      continue;
    }

    const primary = { ...mergeCandidates[0] };
    primary.description = mergeCandidates.map((m) => m.description).join(' ');
    primary.sourceSignals = [...new Set(mergeCandidates.flatMap((m) => m.sourceSignals || []))];
    primary.actions = mergeCandidates.flatMap((m) => m.actions || []).slice(0, 3);
    primary.urgency = Math.max(...mergeCandidates.map((m) => m.urgency));
    primary.confidence = Math.round(
      mergeCandidates.reduce((s, m) => s + m.confidence, 0) / mergeCandidates.length
    );

    const mergedInto = mergeCandidates.slice(1).map((m) => m);
    primary.planner = { isDuplicate: false, conflictGroup: targetType, planOrder: 0 };
    merged.push(primary);
  }

  return merged;
}

function prioritizeByGoals(recs, profile) {
  const goals = profile?.identity?.goals || [];
  const goalLower = goals.map((g) => g.toLowerCase());

  const goalPriority = {
    placement: 5,
    'skill-building': 4,
    'task-management': 3,
    'career-planning': 3,
    wellness: 2,
    learning: 2,
    productivity: 1,
    general: 0,
  };

  return recs.sort((a, b) => {
    const aGoal = (a.goalAlignment?.goal || 'general').toLowerCase().replace(/\s+/g, '-');
    const bGoal = (b.goalAlignment?.goal || 'general').toLowerCase().replace(/\s+/g, '-');

    const aGoalScore = goalLower.some((g) => aGoal.includes(g) || g.includes(aGoal)) ? 10 : 0;
    const bGoalScore = goalLower.some((g) => bGoal.includes(g) || g.includes(bGoal)) ? 10 : 0;

    const aPriority = goalPriority[aGoal] || 0;
    const bPriority = goalPriority[bGoal] || 0;

    const aTotal = aGoalScore + aPriority + (a.urgency || 0) * 0.1;
    const bTotal = bGoalScore + bPriority + (b.urgency || 0) * 0.1;

    return bTotal - aTotal;
  }).slice(0, MAX_DAILY_RECOMMENDATIONS);
}

function assignPlanOrder(recs) {
  return recs.map((r, i) => ({
    ...r,
    planner: {
      ...(r.planner || {}),
      planOrder: i + 1,
    },
  }));
}

module.exports = {
  plan,
  deduplicate,
  resolveConflicts,
  mergeSimilar,
  prioritizeByGoals,
  assignPlanOrder,
};
