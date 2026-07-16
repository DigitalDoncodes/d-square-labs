async function generateDailyMission(userId, recommendations, profile) {
  if (!recommendations?.length) return null;

  const scored = recommendations
    .filter((r) => r.type !== 'focus' && r.type !== 'wellness-suggestion')
    .sort((a, b) => {
      const aScore = (a.v2Scores?.composite || 50) * 0.5 + (a.urgency || 0) * 0.3 + (a.goalAlignment?.relevance || 0) * 0.2;
      const bScore = (b.v2Scores?.composite || 50) * 0.5 + (b.urgency || 0) * 0.3 + (b.goalAlignment?.relevance || 0) * 0.2;
      return bScore - aScore;
    });

  const focus = recommendations.find((r) => r.type === 'focus');
  const top3 = scored.slice(0, 3);
  const top3Titles = top3.map((r) => r.title);

  let totalTime = 0;
  for (const r of top3) {
    const t = r.estimatedCompletionTime?.toLowerCase() || '';
    if (t.includes('5') || t.includes('10 min')) totalTime += 10;
    else if (t.includes('15') || t.includes('20 min')) totalTime += 20;
    else if (t.includes('30')) totalTime += 30;
    else if (t.includes('45')) totalTime += 45;
    else if (t.includes('hour') || t.includes('60')) totalTime += 60;
    else if (t.includes('2 hour')) totalTime += 120;
    else totalTime += 30;
  }

  const missionGoal = focus?.title || top3[0]?.title || 'Complete Today\'s Recommendations';
  const reasoning = buildReasoning(top3, profile, focus);

  const readinessImprovement = _estimateReadinessGain(top3, profile);

  return {
    date: new Date().toISOString().slice(0, 10),
    goal: missionGoal,
    tasks: top3Titles,
    estimatedCompletionTime: `${totalTime} min`,
    expectedReadinessImprovement: readinessImprovement,
    reasoning,
    generatedAt: new Date(),
  };
}

function buildReasoning(top3, profile, focus) {
  const parts = [];

  if (focus) {
    parts.push(`Today's focus is "${focus.title}" based on your current state.`);
  }

  if (profile?.scores?.urgencyLevel > 60) {
    parts.push('Several items require immediate attention — prioritising urgent tasks first.');
  }

  if (profile?.scores?.motivationLevel < 40) {
    parts.push('Starting with smaller, achievable tasks to rebuild momentum.');
  }

  if (profile?.identity?.goals?.length) {
    const goals = profile.identity.goals.slice(0, 2).join(' and ');
    parts.push(`These recommendations align with your goals: ${goals}.`);
  }

  if (top3.length) {
    const reasons = top3.map((r) => r.reason?.split('.')[0] || r.title).filter(Boolean);
    parts.push(...reasons.slice(0, 2));
  }

  return parts.join(' ');
}

function _estimateReadinessGain(top3, profile) {
  if (!top3.length) return 'Minimal';

  const scores = top3.map((r) => r.v2Scores?.impact || r.urgency || 50);
  const avgImpact = scores.reduce((s, v) => s + v, 0) / scores.length;

  if (avgImpact > 75) return 'Significant improvement expected';
  if (avgImpact > 55) return 'Moderate improvement expected';
  if (avgImpact > 35) return 'Slight improvement expected';
  return 'Maintenance level';
}

module.exports = { generateDailyMission };
