const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.scores) return [];

  const scores = profile.scores;
  const career = profile.career || {};
  const identity = profile.identity || {};
  const learning = profile.learning || {};
  const daysToPlacement = identity.daysToPlacement;
  const readiness = scores.careerReadiness || 0;

  const suggestions = [];

  // Low readiness
  if (readiness < 50) {
    const missing = [];
    if (!career.hasResume) missing.push('resume');
    if (!career.skills?.length) missing.push('skills');
    if (!career.starStoriesCount) missing.push('STAR stories');
    if (!career.companiesResearched) missing.push('company research');

    suggestions.push(createRecommendation({
      type: 'placement-readiness',
      title: 'Placement Readiness Needs Attention',
      description: missing.length
        ? `Your readiness score is ${readiness}/100. Start by building: ${missing.join(', ')}.`
        : `Your readiness score is ${readiness}/100. Consider mock interviews and case practice to improve.`,
      reason: `Readiness score ${readiness} is significantly below the 70 target.${missing.length ? ` Missing: ${missing.join(', ')}.` : ''}${daysToPlacement != null ? ` Only ${daysToPlacement} days remaining.` : ''}`,
      confidence: 90,
      urgency: daysToPlacement != null && daysToPlacement <= 60 ? 90 : 65,
      expectedImpact: 'Closing readiness gaps directly improves placement outcomes.',
      estimatedCompletionTime: 'Varies by gap — start with 30 min today',
      sourceSignals: [
        `readiness-${readiness}`,
        ...missing.map((m) => `missing-${m}`),
        daysToPlacement != null ? `days-to-placement-${daysToPlacement}` : '',
      ].filter(Boolean),
      actions: [
        ...(!career.hasResume ? [{ label: 'Build Resume', route: '/resume' }] : []),
        ...(!career.starStoriesCount ? [{ label: 'Write STAR Stories', route: '/star-stories' }] : []),
        { label: 'Company Research', route: '/companies' },
      ],
    }));
  }

  // Good readiness but placement is near
  if (readiness >= 70 && daysToPlacement != null && daysToPlacement <= 30) {
    suggestions.push(createRecommendation({
      type: 'placement-readiness',
      title: 'Final Placement Sprint',
      description: `You're well-prepared (${readiness}/100) with ${daysToPlacement} days to go. Focus on mock interviews, current affairs, and relaxation techniques.`,
      reason: `High readiness (${readiness}) combined with imminent placement (${daysToPlacement} days). Final sprint should focus on polish, not fundamentals.`,
      confidence: 85,
      urgency: 85,
      expectedImpact: 'Converts preparation into placement success.',
      estimatedCompletionTime: '1–2 hours daily',
      sourceSignals: [`readiness-${readiness}`, `days-to-placement-${daysToPlacement}`],
      actions: [
        { label: 'Mock Interview', route: '/ai/interview-simulator' },
        { label: 'Daily Case', route: '/daily-case' },
      ],
    }));
  }

  // Strong preparation, placement distant — maintain
  if (readiness >= 70 && (daysToPlacement == null || daysToPlacement > 60)) {
    suggestions.push(createRecommendation({
      type: 'placement-readiness',
      title: 'Maintain Placement Momentum',
      description: `You're at ${readiness}/100 readiness. Maintain with ${learning.streak > 0 ? `your ${learning.streak}-day streak` : 'daily practice'} and periodic mock interviews.`,
      reason: `Good readiness (${readiness}) with adequate time${daysToPlacement != null ? ` (${daysToPlacement} days)` : ''}. Maintenance is more efficient than cramming later.`,
      confidence: 75,
      urgency: 30,
      expectedImpact: 'Sustains readiness without burnout.',
      estimatedCompletionTime: '20–30 min daily',
      sourceSignals: [`readiness-${readiness}`, learning.streak > 0 ? `streak-${learning.streak}` : ''].filter(Boolean),
      actions: [
        { label: 'Daily Case', route: '/daily-case' },
        { label: 'Company Research', route: '/companies' },
      ],
    }));
  }

  return suggestions;
}

module.exports = { generate };
