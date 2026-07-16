const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile) return [];

  const career = profile.career || {};
  const learning = profile.learning || {};
  const scores = profile.scores;

  const suggestions = [];

  // Active interviews
  if (career.interviewCount > 0) {
    suggestions.push(createRecommendation({
      type: 'interview-suggestion',
      title: `Prepare for ${career.interviewCount} Active Interview${career.interviewCount > 1 ? 's' : ''}`,
      description: `You have ${career.interviewCount} interview${career.interviewCount > 1 ? 's in progress' : ' in progress'}. Focus on company-specific research, case frameworks, and behavioural stories.`,
      reason: `${career.interviewCount} active interview${career.interviewCount > 1 ? 's' : ''} from placement applications. Preparation directly impacts outcomes.`,
      confidence: 90,
      urgency: 80,
      expectedImpact: 'Directly improves interview performance and offer probability.',
      estimatedCompletionTime: '1–2 hours per interview',
      sourceSignals: [`interview-count-${career.interviewCount}`, 'placement-application-status'],
      actions: [
        { label: 'Mock Interview', route: '/ai/interview-simulator' },
        { label: 'Company Research', route: '/companies' },
      ],
    }));
  }

  // Case practice needed
  const solvedCount = learning.solvedCaseCount || 0;
  if (solvedCount < 10 && scores?.careerReadiness != null && scores.careerReadiness > 30) {
    suggestions.push(createRecommendation({
      type: 'interview-suggestion',
      title: 'Build Case Interview Practice',
      description: `You've solved ${solvedCount} case${solvedCount === 1 ? '' : 's'}. Aim for 20+ cases across strategy, marketing, finance, and operations before interviews.`,
      reason: `${solvedCount} cases solved. Consulting and strategy roles typically expect 20+ practised cases.`,
      confidence: 80,
      urgency: (career.interviewCount || 0) > 0 ? 85 : 50,
      expectedImpact: 'Case interviews are the most common selection tool for consulting roles.',
      estimatedCompletionTime: '20–30 min per case',
      sourceSignals: [`cases-solved-${solvedCount}`],
      actions: [{ label: 'Solve Cases', route: '/daily-case' }],
    }));
  }

  // STAR story practice
  if ((career.starStoriesCount || 0) >= 3 && (career.interviewCount || 0) > 0) {
    suggestions.push(createRecommendation({
      type: 'interview-suggestion',
      title: 'Refine Your STAR Stories',
      description: `You have ${career.starStoriesCount} STAR stories. Practice delivering them concisely (60–90 seconds each) with measurable outcomes.`,
      reason: `${career.starStoriesCount} stories prepared. Active interviews require polished delivery with quantifiable results.`,
      confidence: 75,
      urgency: 70,
      expectedImpact: 'Polished STAR delivery differentiates candidates in behavioural rounds.',
      estimatedCompletionTime: '10–15 min per story',
      sourceSignals: [`star-stories-${career.starStoriesCount}`, 'active-interviews'],
      actions: [{ label: 'Practice Stories', route: '/star-stories' }],
    }));
  }

  // General interview readiness
  if ((career.interviewCount || 0) === 0 && scores?.careerReadiness != null && scores.careerReadiness >= 50) {
    suggestions.push(createRecommendation({
      type: 'interview-suggestion',
      title: 'Start Mock Interviews Early',
      description: 'You don\'t have active interviews yet, but early mock interview practice builds confidence and identifies gaps.',
      reason: 'Proactive interview preparation correlates with higher offer rates. Starting before interviews arrive reduces anxiety.',
      confidence: 65,
      urgency: 30,
      expectedImpact: 'Builds confidence and identifies preparation gaps early.',
      estimatedCompletionTime: '30 min',
      sourceSignals: ['no-active-interviews', `readiness-${scores.careerReadiness}`],
      actions: [{ label: 'Mock Interview', route: '/ai/interview-simulator' }],
    }));
  }

  return suggestions;
}

module.exports = { generate };
