const Recommendation = require('../../models/Recommendation');

const FEEDBACK_WEIGHTS = {
  'helpful': { rankBoost: 0.2, confidenceBoost: 10 },
  'not-helpful': { rankPenalty: -0.3, confidencePenalty: -15 },
  'already-done': { rankPenalty: -0.4, autoDismiss: true },
  'remind-tomorrow': { rankBoost: 0.1, postponeMs: 24 * 60 * 60 * 1000 },
  'never-suggest': { rankPenalty: -1.0, autoDismiss: true },
  'lower-priority': { rankPenalty: -0.5, urgencyPenalty: -20 },
};

async function recordFeedback(userId, recId, feedbackType) {
  const rec = await Recommendation.findOne({ _id: recId, user: userId });
  if (!rec) return null;

  const weight = FEEDBACK_WEIGHTS[feedbackType];
  if (!weight) return { error: `Unknown feedback type: ${feedbackType}` };

  const now = new Date();

  const update = {
    $push: { feedback: { type: feedbackType, at: now } },
  };

  if (feedbackType === 'never-suggest') {
    update.dismissed = true;
    update['lifecycle.state'] = 'dismissed';
    update['lifecycle.dismissedAt'] = now;
    update.$push = {
      ...(update.$push || {}),
      'lifecycle.transitions': { to: 'dismissed', at: now },
    };
  }

  if (feedbackType === 'already-done') {
    update['lifecycle.state'] = 'completed';
    update['lifecycle.completedAt'] = now;
    update.$push = {
      ...(update.$push || {}),
      'lifecycle.transitions': { to: 'completed', at: now },
    };
  }

  await Recommendation.findOneAndUpdate({ _id: recId, user: userId }, update);

  return { applied: true, weight, feedbackType };
}

function getAdjustedRanking(recs) {
  return recs.map((rec) => {
    const feedbacks = rec.feedback || [];
    let adjustment = 0;

    for (const fb of feedbacks) {
      const weight = FEEDBACK_WEIGHTS[fb.type];
      if (!weight) continue;
      adjustment += weight.rankBoost || weight.rankPenalty || 0;
    }

    const effectiveConfidence = feedbacks.reduce((conf, fb) => {
      const w = FEEDBACK_WEIGHTS[fb.type];
      if (!w) return conf;
      return conf + (w.confidenceBoost || w.confidencePenalty || 0);
    }, rec.confidence || 50);

    const effectiveUrgency = feedbacks.reduce((urg, fb) => {
      const w = FEEDBACK_WEIGHTS[fb.type];
      if (!w || !w.urgencyPenalty) return urg;
      return urg + w.urgencyPenalty;
    }, rec.urgency || 0);

    const adjustedScore = (effectiveConfidence * 0.4 + effectiveUrgency * 0.35) * (1 + adjustment);

    return {
      ...rec,
      adjustedScore: Math.round(Math.max(0, adjustedScore)),
      effectiveConfidence: Math.max(0, Math.min(100, effectiveConfidence)),
      effectiveUrgency: Math.max(0, Math.min(100, effectiveUrgency)),
    };
  }).sort((a, b) => b.adjustedScore - a.adjustedScore);
}

function getFeedbackStats(recs) {
  const counts = { helpful: 0, 'not-helpful': 0, 'already-done': 0, 'remind-tomorrow': 0, 'never-suggest': 0, 'lower-priority': 0 };

  for (const rec of recs) {
    for (const fb of rec.feedback || []) {
      if (counts[fb.type] !== undefined) counts[fb.type]++;
    }
  }

  return counts;
}

module.exports = {
  recordFeedback,
  getAdjustedRanking,
  getFeedbackStats,
  FEEDBACK_WEIGHTS,
};
