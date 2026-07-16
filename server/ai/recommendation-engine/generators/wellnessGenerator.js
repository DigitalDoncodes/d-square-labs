const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.scores) return [];

  const s = [];
  const stress = profile.stress || {};
  const scores = profile.scores;
  const learning = profile.learning || {};
  const tasks = profile.tasks || {};

  // High stress
  if (stress.stressLevel > 60) {
    const reasons = [];
    if (stress.overdueCount > 3) reasons.push(`${stress.overdueCount} overdue tasks`);
    if (stress.nearDeadlineCount > 2) reasons.push(`${stress.nearDeadlineCount} near deadlines`);
    if (stress.rejectedCount > 1) reasons.push(`${stress.rejectedCount} recent rejections`);

    s.push(createRecommendation({
      type: 'wellness-suggestion',
      title: 'Stress Level Elevated — Take a Moment',
      description: `Your stress indicators suggest elevated pressure${reasons.length ? ` from ${reasons.join(', ')}` : ''}. Consider a short break, deep breathing, or talking to a friend. Small pauses improve clarity.`,
      reason: `Stress level ${stress.stressLevel}/100 detected from ${reasons.join(', ') || 'multiple indicators'}. Chronic stress reduces cognitive performance and learning retention.`,
      confidence: 85,
      urgency: stress.stressLevel > 80 ? 70 : 50,
      expectedImpact: 'Improves mental clarity, focus, and learning effectiveness.',
      estimatedCompletionTime: '5–10 min',
      sourceSignals: [`stress-${stress.stressLevel}`, ...reasons.map((r) => r.toLowerCase().replace(/\s+/g, '-'))],
      actions: [{ label: 'Take a Break', route: '/' }],
    }));
  }

  // Low motivation
  if (scores.motivationLevel < 40) {
    s.push(createRecommendation({
      type: 'wellness-suggestion',
      title: 'Rebuild Momentum with Small Wins',
      description: `Your motivation score is ${scores.motivationLevel}/100. Start with one small task (5–10 min) to rebuild momentum. Progress, not perfection.`,
      reason: `Motivation level ${scores.motivationLevel} is below 40 threshold. Small wins trigger dopamine release and rebuild momentum.`,
      confidence: 75,
      urgency: 40,
      expectedImpact: 'Rebuilds motivation through achievable small wins.',
      estimatedCompletionTime: '5–10 min',
      sourceSignals: [`motivation-${scores.motivationLevel}`],
      actions: [{ label: 'Pick a Small Task', route: '/tasks' }],
    }));
  }

  // Long streak — prevent burnout
  if (learning.streak >= 14 && learning.consistency > 80) {
    s.push(createRecommendation({
      type: 'wellness-suggestion',
      title: `${learning.streak}-Day Streak! Take a Rest Day`,
      description: `Amazing ${learning.streak}-day streak! Your consistency is ${learning.consistency}%. A planned rest day prevents burnout and improves long-term retention.`,
      reason: `${learning.streak}-day streak with ${learning.consistency}% consistency. Extended high-intensity study can lead to burnout. Strategic rest improves performance.`,
      confidence: 70,
      urgency: 25,
      expectedImpact: 'Prevents burnout and sustains long-term learning.',
      estimatedCompletionTime: 'Full day off',
      sourceSignals: [`streak-${learning.streak}`, `consistency-${learning.consistency}`],
      actions: [{ label: 'View Progress', route: '/study-tools' }],
    }));
  }

  // No recent activity — re-engagement
  if (learning.lastActivity) {
    const daysSince = Math.ceil((new Date() - new Date(learning.lastActivity)) / 86400000);
    if (daysSince > 3) {
      s.push(createRecommendation({
        type: 'wellness-suggestion',
        title: 'Welcome Back! Resume Your Learning',
        description: `It's been ${daysSince} days since your last activity. Start with something familiar to ease back in — review a strong topic or solve a case.`,
        reason: `${daysSince} days since last activity detected. Extended breaks reduce retention and break habit loops.`,
        confidence: 80,
        urgency: 35,
        expectedImpact: 'Re-establishes learning habits and prevents skill decay.',
        estimatedCompletionTime: '15 min',
        sourceSignals: [`days-since-activity-${daysSince}`],
        actions: [{ label: 'Solve a Case', route: '/daily-case' }],
      }));
    }
  }

  // Inconsistent sleep/study patterns (rough proxy via late-night activity)
  if (learning.todayStudyMinutes > 120 && scores.urgencyLevel < 30) {
    s.push(createRecommendation({
      type: 'wellness-suggestion',
      title: 'Balance Study and Rest',
      description: `You've studied ${learning.todayStudyMinutes} minutes today. Ensure you're taking breaks, staying hydrated, and getting enough sleep.`,
      reason: `High study volume (${learning.todayStudyMinutes} min) without proportional urgency. Sustainable pacing prevents burnout.`,
      confidence: 60,
      urgency: 20,
      expectedImpact: 'Sustains long-term learning effectiveness.',
      estimatedCompletionTime: 'Ongoing',
      sourceSignals: [`study-minutes-${learning.todayStudyMinutes}`],
      actions: [{ label: 'Track Habits', route: '/study-tools' }],
    }));
  }

  return s;
}

module.exports = { generate };
