const TYPE_TO_GOAL_MAP = {
  'focus':               { goal: 'productivity', relevance: 70 },
  'priority':            { goal: 'task-management', relevance: 80 },
  'study-session':       { goal: 'skill-building', relevance: 75 },
  'ai-action':           { goal: 'learning', relevance: 65 },
  'weak-topic-alert':    { goal: 'skill-building', relevance: 85 },
  'placement-readiness': { goal: 'placement', relevance: 90 },
  'resume-suggestion':   { goal: 'placement', relevance: 85 },
  'interview-suggestion':{ goal: 'placement', relevance: 90 },
  'deadline-alert':      { goal: 'task-management', relevance: 80 },
  'planner-suggestion':  { goal: 'career-planning', relevance: 70 },
  'wellness-suggestion': { goal: 'wellness', relevance: 75 },
};

const GENERIC_GOAL = { goal: 'general', relevance: 50 };

function alignRecommendation(rec, profile) {
  const defaultAlignment = TYPE_TO_GOAL_MAP[rec.type] || GENERIC_GOAL;

  const userGoals = profile?.identity?.goals || [];
  if (!userGoals.length) return defaultAlignment;

  let bestMatch = defaultAlignment;
  let bestScore = 0;

  for (const userGoal of userGoals) {
    const ug = userGoal.toLowerCase();
    for (const [type, mapping] of Object.entries(TYPE_TO_GOAL_MAP)) {
      if (type !== rec.type) continue;
      const mg = mapping.goal.toLowerCase();

      let score = mapping.relevance;
      if (ug.includes(mg) || mg.includes(ug)) {
        score += 15;
      }
      if (ug === mg) {
        score += 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = { goal: userGoal, relevance: Math.min(100, score) };
      }
    }
  }

  return bestMatch;
}

function alignAll(recommendations, profile) {
  return recommendations.map((rec) => ({
    ...rec,
    goalAlignment: alignRecommendation(rec, profile),
  }));
}

function getGoalSummary(recommendations) {
  const summary = {};
  for (const rec of recommendations) {
    const goal = rec.goalAlignment?.goal || 'general';
    if (!summary[goal]) summary[goal] = { count: 0, totalRelevance: 0, types: [] };
    summary[goal].count++;
    summary[goal].totalRelevance += rec.goalAlignment?.relevance || 0;
    if (!summary[goal].types.includes(rec.type)) summary[goal].types.push(rec.type);
  }

  return Object.entries(summary).map(([goal, data]) => ({
    goal,
    count: data.count,
    avgRelevance: Math.round(data.totalRelevance / data.count),
    types: data.types,
  })).sort((a, b) => b.avgRelevance - a.avgRelevance);
}

module.exports = {
  alignRecommendation,
  alignAll,
  getGoalSummary,
  TYPE_TO_GOAL_MAP,
};
