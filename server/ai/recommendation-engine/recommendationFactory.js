const crypto = require('crypto');

function createRecommendation({ type, title, description, reason, confidence, urgency, expectedImpact, estimatedCompletionTime, sourceSignals, actions, expiresAt }) {
  const id = crypto.randomBytes(8).toString('hex');
  return {
    id,
    type,
    title,
    description,
    reason,
    confidence: Math.max(0, Math.min(100, confidence)),
    urgency: Math.max(0, Math.min(100, urgency)),
    expectedImpact: expectedImpact || '',
    estimatedCompletionTime: estimatedCompletionTime || '',
    sourceSignals: sourceSignals || [],
    actions: actions || [],
    dismissed: false,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
  };
}

function score(rec) {
  return Math.round(rec.confidence * 0.4 + rec.urgency * 0.35 + (rec.sourceSignals?.length || 0) * 5);
}

function sortByScore(recommendations) {
  return [...recommendations].sort((a, b) => score(b) - score(a));
}

function rankByUrgency(recommendations) {
  return [...recommendations].sort((a, b) => b.urgency - a.urgency);
}

module.exports = { createRecommendation, score, sortByScore, rankByUrgency };
