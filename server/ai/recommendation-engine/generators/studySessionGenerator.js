const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.scores) return [];

  const learning = profile.learning || {};
  const scores = profile.scores;
  const weakTopics = learning.weakTopics || [];
  const strongTopics = learning.strongTopics || [];
  const streak = learning.streak || 0;
  const consistency = learning.consistency || 0;

  const recommendations = [];

  // Recommend study session based on weak topics
  if (weakTopics.length) {
    const topic = weakTopics[0];
    recommendations.push(createRecommendation({
      type: 'study-session',
      title: `Study Session: Master ${topic}`,
      description: `Dedicate a focused session to ${topic}. ${weakTopics.length > 1 ? `Also consider reviewing ${weakTopics.slice(1, 3).join(', ')}.` : ''} Use the Pomodoro technique for focused learning.`,
      reason: `${topic} identified as a weak area${weakTopics.length > 1 ? ` (along with ${weakTopics.length - 1} other topic${weakTopics.length > 1 ? 's' : ''})` : ''}. Targeted study sessions improve topic mastery and confidence.`,
      confidence: Math.min(90, 60 + (weakTopics.length > 1 ? 15 : 0)),
      urgency: scores?.urgencyLevel > 50 ? 65 : 40,
      expectedImpact: 'Strengthens weak areas, increases confidence, improves readiness.',
      estimatedCompletionTime: '45–60 min',
      sourceSignals: [`weak-topic-${topic}`, `weak-topic-count-${weakTopics.length}`],
      actions: [{ label: 'Start Study Session', route: '/study-tools' }],
    }));
  }

  // Recommend review of strong topics if streak is active
  if (streak >= 3 && strongTopics.length) {
    recommendations.push(createRecommendation({
      type: 'study-session',
      title: `Quick Review: ${strongTopics[0]}`,
      description: `You're on a ${streak}-day streak. Reinforce ${strongTopics[0]} with a quick review session to keep the knowledge fresh.`,
      reason: `${streak}-day streak indicates active learning. Reviewing strong topics (${strongTopics[0]}) reinforces retention and builds confidence.`,
      confidence: 70,
      urgency: 30,
      expectedImpact: 'Reinforces existing knowledge, maintains streak momentum.',
      estimatedCompletionTime: '20–30 min',
      sourceSignals: [`streak-${streak}`, `strong-topic-${strongTopics[0]}`],
      actions: [{ label: 'Review Now', route: '/study-tools' }],
    }));
  }

  // Recommend daily case if no case solved today and streak is low
  if (streak === 0 || !learning.hasTodayHabit) {
    recommendations.push(createRecommendation({
      type: 'study-session',
      title: 'Solve a Daily Case',
      description: streak === 0
        ? 'You haven\'t solved a case today. A single case takes 15–20 minutes and keeps your streak alive.'
        : 'Solve today\'s case to maintain your learning momentum.',
      reason: streak === 0
        ? 'No active case streak. Daily case practice builds structured thinking.'
        : 'Consistent case practice correlates with higher placement readiness.',
      confidence: 75,
      urgency: streak === 0 ? 50 : 35,
      expectedImpact: 'Builds structured thinking, maintains streak.',
      estimatedCompletionTime: '15–20 min',
      sourceSignals: streak === 0 ? ['no-streak'] : [`streak-${streak}`],
      actions: [{ label: 'Solve Case', route: '/daily-case' }],
    }));
  }

  return recommendations;
}

module.exports = { generate };
