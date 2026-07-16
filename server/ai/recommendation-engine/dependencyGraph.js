const Recommendation = require('../../models/Recommendation');

const TYPE_DEPENDENCIES = {
  'interview-suggestion': [{ type: 'resume-suggestion', status: 'completed' }],
  'placement-readiness': [
    { type: 'resume-suggestion', status: 'completed' },
    { type: 'interview-suggestion', status: 'seen' },
  ],
  'planner-suggestion': [{ type: 'focus', status: 'seen' }],
};

const TYPE_PREREQUISITES = {
  'resume-suggestion': [],
  'interview-suggestion': ['resume-suggestion'],
  'placement-readiness': ['resume-suggestion', 'interview-suggestion'],
  'study-session': ['weak-topic-alert'],
  'ai-action': ['study-session', 'weak-topic-alert'],
  'deadline-alert': [],
  'priority': ['deadline-alert'],
  'planner-suggestion': ['focus'],
  'wellness-suggestion': [],
  'focus': [],
};

async function resolveDependencies(userId, recommendations) {
  const completed = await Recommendation.find({
    user: userId,
    'lifecycle.state': { $in: ['completed', 'started'] },
  }).select('type').lean();

  const completedTypes = new Set(completed.map((r) => r.type));

  return recommendations.map((rec) => {
    const prereqs = TYPE_PREREQUISITES[rec.type] || [];
    const missing = prereqs.filter((p) => !completedTypes.has(p));
    const satisfied = prereqs.filter((p) => completedTypes.has(p));

    return {
      ...rec,
      dependencyStatus: {
        prerequisites: prereqs,
        satisfied,
        missing,
        blocked: missing.length > 0,
      },
    };
  });
}

function getDependencyChain(recType) {
  const chain = [recType];
  const prereqs = TYPE_PREREQUISITES[recType] || [];
  for (const p of prereqs) {
    chain.unshift(p);
    const sub = TYPE_PREREQUISITES[p] || [];
    for (const s of sub) {
      if (!chain.includes(s)) chain.unshift(s);
    }
  }
  return chain;
}

function getDependencyGraph() {
  return TYPE_PREREQUISITES;
}

async function getNextInChain(userId, recType) {
  const completed = await Recommendation.find({
    user: userId,
    'lifecycle.state': { $in: ['completed', 'started'] },
  }).select('type').lean();

  const completedTypes = new Set(completed.map((r) => r.type));

  for (const [type, prereqs] of Object.entries(TYPE_PREREQUISITES)) {
    const allFulfilled = prereqs.every((p) => completedTypes.has(p) || p === recType);
    if (allFulfilled && !completedTypes.has(type)) {
      return type;
    }
  }

  return null;
}

module.exports = {
  resolveDependencies,
  getDependencyChain,
  getDependencyGraph,
  getNextInChain,
  TYPE_PREREQUISITES,
};
