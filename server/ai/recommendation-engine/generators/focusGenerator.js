const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.scores) return [];

  const s = profile.scores;
  const focus = s.currentFocus || 'general';
  const urgency = s.urgencyLevel || 0;
  const challenges = s.currentChallenges || [];

  const focusLabels = {
    'deadline-pressure': 'Manage Urgent Deadlines',
    'catch-up': 'Catch Up on Overdue Work',
    'placement-prep': 'Focus on Placement Preparation',
    'interview-prep': 'Prepare for Upcoming Interviews',
    'task-management': 'Organise and Complete Tasks',
    'skill-building': 'Build Core Skills',
    exploration: 'Explore New Topics',
    general: 'Continue Your Learning Journey',
  };

  const focusDescriptions = {
    'deadline-pressure': `You have ${challenges.filter((c) => c.includes('Overdue')).length > 0 ? 'overdue tasks' : 'approaching deadlines'} that need immediate attention. Prioritise completing these before starting new work.`,
    'catch-up': `${challenges.length ? challenges[0] : 'Several tasks need your attention'}. Dedicate today to clearing backlog.`,
    'placement-prep': placementPrepDescription(s, profile),
    'interview-prep': `You have active interviews${profile?.career?.interviewCount ? ` (${profile.career.interviewCount})` : ''}. Focus on company research, case practice, and STAR story refinement.`,
    'task-management': `You have ${profile?.tasks?.pending || 0} pending tasks. Start with the most time-sensitive ones.`,
    'skill-building': `You're on a ${profile?.learning?.streak || 0}-day streak. Use this momentum to deepen your understanding of key concepts.`,
    exploration: 'Explore topics that interest you or fill knowledge gaps in your preparation.',
    general: 'Review your dashboard for personalised recommendations based on your current progress.',
  };

  const signalSources = ['computed-focus', `urgency-${urgency}`];
  if (challenges.length) signalSources.push(`challenge-${challenges[0].toLowerCase().replace(/\s+/g, '-')}`);
  if (focus === 'placement-prep' && profile?.identity?.daysToPlacement != null) {
    signalSources.push(`days-to-placement-${profile.identity.daysToPlacement}`);
  }

  return [createRecommendation({
    type: 'focus',
    title: focusLabels[focus] || focusLabels.general,
    description: focusDescriptions[focus] || focusDescriptions.general,
    reason: `Detected focus "${focus}" from ${signalSources.length} signals including urgency (${urgency}/100)${challenges.length ? ` and challenge: ${challenges[0]}` : ''}.`,
    confidence: Math.min(90, 50 + urgency * 0.3 + (challenges.length > 0 ? 15 : 0)),
    urgency,
    expectedImpact: 'Provides clear direction for the day, reducing decision fatigue.',
    estimatedCompletionTime: 'All day',
    sourceSignals: signalSources,
    actions: [{ label: 'View Recommendations', route: '/recommendations' }],
  })];
}

function placementPrepDescription(s, profile) {
  const days = profile?.identity?.daysToPlacement;
  const readiness = s.careerReadiness || 0;

  if (days != null && days <= 30) {
    return `Placement season is ${days} days away and your readiness is ${readiness}/100. Prioritise mock interviews, company research, and case practice daily.`;
  }
  if (readiness < 50) {
    return `Your placement readiness is ${readiness}/100. Focus on resume refinement, skill-building, and company research to close the gap.`;
  }
  return `Placement season is approaching. Maintain your preparation momentum with daily case practice and interview prep.`;
}

module.exports = { generate };
