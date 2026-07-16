const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.learning?.weakTopics?.length) return [];

  const weakTopics = profile.learning.weakTopics;
  const strongTopics = profile.learning.strongTopics || [];
  const scores = profile.scores;

  return weakTopics.slice(0, 3).map((topic, i) => ({
    ...createRecommendation({
      type: 'weak-topic-alert',
      title: `Weak Area: ${topic}`,
      description: buildDescription(topic, weakTopics, strongTopics, scores),
      reason: `${topic} flagged as a weak area${weakTopics.length > 1 ? ` (${i + 1} of ${Math.min(weakTopics.length, 3)} identified)` : ''}. ${scores?.learningVelocity != null && scores.learningVelocity < 50 ? 'Your current learning velocity suggests focused effort is needed.' : 'Regular practice can turn this into a strength.'}`,
      confidence: 80 - i * 5,
      urgency: scores?.urgencyLevel > 50 ? 65 : 40,
      expectedImpact: 'Strengthening weak areas improves overall readiness and confidence.',
      estimatedCompletionTime: '30–45 min per topic',
      sourceSignals: [`weak-topic-${topic}`, `weak-topic-index-${i}`],
      actions: [
        { label: `Study ${topic}`, route: '/study-tools' },
        { label: 'Ask AI', route: '/chat' },
      ],
    }),
    sourceSignals: [`weak-topic-${topic}`, `weak-topic-index-${i}`],
  }));
}

function buildDescription(topic, weakTopics, strongTopics, scores) {
  const parts = [`"${topic}" is identified as an area that needs attention.`];
  if (strongTopics.includes(topic)) {
    parts.push('Although listed as a strength in some contexts, targeted practice will ensure mastery.');
  }
  if (scores?.learningVelocity >= 60) {
    parts.push('Your learning velocity is strong — you can overcome this with focused sessions.');
  } else {
    parts.push('Consider dedicating 30 minutes daily to this topic.');
  }
  if (weakTopics.length > 1) {
    parts.push(`${weakTopics.filter((t) => t !== topic).slice(0, 2).join(', ')} ${weakTopics.length > 2 ? 'and other areas' : ''} may also need attention.`);
  }
  return parts.join(' ');
}

module.exports = { generate };
