const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile) return [];

  const actions = [];
  const memory = profile.memory || {};
  const scores = profile.scores;
  const career = profile.career || {};
  const learning = profile.learning || {};
  const activity = profile.activity || {};
  const weakTopics = learning.weakTopics || [];
  const recentTopics = memory.recentTopics || [];

  // Recommend AI chat if recent queries indicate confusion
  if (activity?.recentQueryTopics?.length && weakTopics.length) {
    const overlapping = activity.recentQueryTopics.filter((t) =>
      weakTopics.some((w) => t.toLowerCase().includes(w.toLowerCase()))
    );
    if (overlapping.length) {
      actions.push(createRecommendation({
        type: 'ai-action',
        title: `Ask AI About ${overlapping[0]}`,
        description: `You've been researching topics related to ${overlapping[0]}, which is flagged as a weak area. Ask AI for a structured explanation with examples.`,
        reason: `Overlap detected between recent queries (${overlapping.join(', ')}) and identified weak topics. AI can provide targeted explanations.`,
        confidence: 80,
        urgency: 40,
        expectedImpact: 'Deepens understanding of weak topics through personalised AI tutoring.',
        estimatedCompletionTime: '10–15 min',
        sourceSignals: [`weak-topic-${overlapping[0]}`, 'recent-query-overlap'],
        actions: [{ label: 'Ask AI', route: '/chat' }],
      }));
    }
  }

  // Recommend resume review if not done recently
  if (career.hasResume && career.resumeCompletionPct < 80) {
    actions.push(createRecommendation({
      type: 'ai-action',
      title: 'Improve Your Resume with AI',
      description: `Your resume is ${career.resumeCompletionPct}% complete. AI can review and suggest improvements for better placement outcomes.`,
      reason: `Resume completion at ${career.resumeCompletionPct}%. AI-powered review can identify gaps in skills, experience, and presentation.`,
      confidence: 85,
      urgency: scores?.careerReadiness != null && scores.careerReadiness < 60 ? 70 : 45,
      expectedImpact: 'Higher resume completion correlates with better placement outcomes.',
      estimatedCompletionTime: '15–20 min',
      sourceSignals: [`resume-completion-${career.resumeCompletionPct}`],
      actions: [{ label: 'Review Resume', route: '/ai/review-resume' }],
    }));
  }

  // Recommend interview practice if interviews are active
  if (career.interviewCount > 0) {
    actions.push(createRecommendation({
      type: 'ai-action',
      title: 'Practice Mock Interview',
      description: `You have ${career.interviewCount} active interview${career.interviewCount > 1 ? 's' : ''}. Use AI to simulate interview questions and get feedback.`,
      reason: `${career.interviewCount} active interview${career.interviewCount > 1 ? 's' : ''} detected. Mock interviews improve confidence and performance.`,
      confidence: 90,
      urgency: 75,
      expectedImpact: 'Improves interview performance and confidence.',
      estimatedCompletionTime: '30 min',
      sourceSignals: [`interview-count-${career.interviewCount}`, 'placement-application-status'],
      actions: [{ label: 'Start Mock Interview', route: '/ai/interview-simulator' }],
    }));
  }

  // Recommend comparison if researching companies
  if (career.companiesResearched > 3 && career.targetCompanies?.length > 1) {
    actions.push(createRecommendation({
      type: 'ai-action',
      title: `Compare ${career.targetCompanies[0]} vs ${career.targetCompanies[1] || 'Other'}`,
      description: `You've researched ${career.companiesResearched} companies. Use AI to compare recruiters side-by-side for informed decisions.`,
      reason: `Active company research (${career.companiesResearched} companies) with multiple targets suggests a comparison would aid decision-making.`,
      confidence: 70,
      urgency: 35,
      expectedImpact: 'Informed decision-making for placement targeting.',
      estimatedCompletionTime: '5–10 min',
      sourceSignals: [`companies-researched-${career.companiesResearched}`, 'target-companies'],
      actions: [{ label: 'Compare Companies', route: '/ai/compare-companies' }],
    }));
  }

  // Recommend career advice if readiness is low and placement is near
  if (scores?.careerReadiness != null && scores.careerReadiness < 50 &&
      profile?.identity?.daysToPlacement != null && profile.identity.daysToPlacement <= 90) {
    actions.push(createRecommendation({
      type: 'ai-action',
      title: 'Get Personalised Career Advice',
      description: `Placement is ${profile.identity.daysToPlacement} days away and your readiness is ${scores.careerReadiness}/100. AI can create a custom preparation plan.`,
      reason: `Low readiness (${scores.careerReadiness}/100) combined with imminent placement (${profile.identity.daysToPlacement} days). Personalised advice can accelerate preparation.`,
      confidence: 85,
      urgency: 80,
      expectedImpact: 'Accelerates placement preparation with targeted guidance.',
      estimatedCompletionTime: '15 min',
      sourceSignals: [`career-readiness-${scores.careerReadiness}`, `days-to-placement-${profile.identity.daysToPlacement}`],
      actions: [{ label: 'Get Advice', route: '/ai/career-advice' }],
    }));
  }

  return actions;
}

module.exports = { generate };
