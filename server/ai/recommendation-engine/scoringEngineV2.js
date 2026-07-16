function computeV2Scores(rec, profile) {
  const typeScores = getTypeBaseline(rec.type);

  const expectedValue = computeExpectedValue(rec, profile, typeScores);
  const estimatedTime = computeEstimatedTime(rec, profile, typeScores);
  const difficulty = computeDifficulty(rec, profile, typeScores);
  const personalRelevance = computePersonalRelevance(rec, profile);
  const goalAlignment = computeGoalAlignment(rec, profile);
  const freshness = computeFreshness(rec);
  const confidence = rec.confidence || 50;
  const urgency = rec.urgency || 50;
  const impact = computeImpact(rec, profile, typeScores);

  const composite = Math.round(
    expectedValue * 0.15 +
    estimatedTime * 0.05 +
    difficulty * 0.10 +
    personalRelevance * 0.20 +
    goalAlignment * 0.20 +
    freshness * 0.05 +
    confidence * 0.10 +
    urgency * 0.10 +
    impact * 0.05
  );

  return {
    expectedValue: Math.round(expectedValue),
    estimatedTime: Math.round(estimatedTime),
    difficulty: Math.round(difficulty),
    personalRelevance: Math.round(personalRelevance),
    goalAlignment: Math.round(goalAlignment),
    freshness: Math.round(freshness),
    confidence: Math.round(confidence),
    urgency: Math.round(urgency),
    impact: Math.round(impact),
    composite,
  };
}

function getTypeBaseline(type) {
  const baselines = {
    'focus':               { value: 70, time: 90, difficulty: 20, impact: 75 },
    'priority':            { value: 80, time: 70, difficulty: 30, impact: 85 },
    'study-session':       { value: 65, time: 50, difficulty: 40, impact: 60 },
    'ai-action':           { value: 60, time: 80, difficulty: 25, impact: 55 },
    'weak-topic-alert':    { value: 75, time: 60, difficulty: 35, impact: 70 },
    'placement-readiness': { value: 85, time: 40, difficulty: 50, impact: 90 },
    'resume-suggestion':   { value: 80, time: 60, difficulty: 30, impact: 80 },
    'interview-suggestion':{ value: 85, time: 40, difficulty: 55, impact: 85 },
    'deadline-alert':      { value: 90, time: 70, difficulty: 25, impact: 80 },
    'planner-suggestion':  { value: 70, time: 60, difficulty: 35, impact: 65 },
    'wellness-suggestion': { value: 55, time: 90, difficulty: 10, impact: 50 },
  };
  return baselines[type] || { value: 50, time: 50, difficulty: 50, impact: 50 };
}

function computeExpectedValue(rec, profile, baseline) {
  let value = baseline.value;
  if (rec.urgency > 70) value += 10;
  if (rec.sourceSignals?.length > 3) value += 5;
  if (profile?.scores?.careerReadiness != null && profile.scores.careerReadiness < 40) {
    if (rec.type === 'placement-readiness' || rec.type === 'resume-suggestion') value += 10;
  }
  return Math.min(100, value);
}

function computeEstimatedTime(rec) {
  const t = rec.estimatedCompletionTime?.toLowerCase() || '';
  if (t.includes('5') || t.includes('10 min')) return 90;
  if (t.includes('15') || t.includes('20 min')) return 75;
  if (t.includes('30')) return 60;
  if (t.includes('hour') || t.includes('60')) return 40;
  if (t.includes('day') || t.includes('ongoing')) return 20;
  return 50;
}

function computeDifficulty(rec, _profile, baseline) {
  return baseline.difficulty;
}

function computePersonalRelevance(rec, profile) {
  if (!profile) return 50;
  let relevance = 50;

  const signals = rec.sourceSignals || [];
  const weakTopics = profile.learning?.weakTopics || [];
  const strongTopics = profile.learning?.strongTopics || [];
  const recentTopics = profile.memory?.recentTopics || [];
  const goals = profile.identity?.goals || [];

  const topicOverlap = signals.filter((s) =>
    [...weakTopics, ...strongTopics, ...recentTopics].some((t) =>
      s.toLowerCase().includes(t.toLowerCase())
    )
  ).length;
  relevance += topicOverlap * 10;

  const goalOverlap = signals.filter((s) =>
    goals.some((g) => s.toLowerCase().includes(g.toLowerCase()))
  ).length;
  relevance += goalOverlap * 10;

  if (rec.type === 'placement-readiness' || rec.type === 'interview-suggestion') {
    if (profile.career?.interviewCount > 0) relevance += 15;
    if (profile.identity?.daysToPlacement != null && profile.identity.daysToPlacement <= 60) relevance += 10;
  }

  if (rec.type === 'deadline-alert' && profile.tasks?.overdue > 0) relevance += 15;
  if (rec.type === 'wellness-suggestion' && profile.stress?.stressLevel > 60) relevance += 15;

  return Math.min(100, relevance);
}

function computeGoalAlignment(rec, profile) {
  if (!profile?.identity?.goals?.length) return 50;

  const goalsLower = profile.identity.goals.map((g) => g.toLowerCase());
  let alignment = 30;

  const goalRecMap = {
    'placement': ['placement-readiness', 'resume-suggestion', 'interview-suggestion', 'deadline-alert'],
    'highereducation': ['study-session', 'weak-topic-alert', 'focus'],
    'higherstudies': ['study-session', 'weak-topic-alert', 'focus'],
    'entrepreneurship': ['planner-suggestion', 'ai-action'],
    'financialliteracy': ['study-session', 'weak-topic-alert'],
    'financial': ['study-session', 'weak-topic-alert'],
    'leadership': ['interview-suggestion', 'planner-suggestion'],
    'communication': ['interview-suggestion', 'ai-action'],
    'research': ['study-session', 'weak-topic-alert'],
    'certifications': ['study-session', 'priority'],
  };

  for (const [goal, types] of Object.entries(goalRecMap)) {
    if (goalsLower.some((g) => g.includes(goal)) && types.includes(rec.type)) {
      alignment += 20;
    }
  }

  return Math.min(100, alignment);
}

function computeFreshness(rec) {
  const createdAt = rec.createdAt ? new Date(rec.createdAt).getTime() : Date.now();
  const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);

  if (ageHours < 1) return 100;
  if (ageHours < 6) return 85;
  if (ageHours < 24) return 65;
  if (ageHours < 72) return 40;
  return 20;
}

function computeImpact(rec, profile, baseline) {
  let impact = baseline.impact;

  if (rec.type === 'deadline-alert' && profile?.tasks?.overdue > 0) impact += 10;
  if (rec.type === 'placement-readiness' && profile?.identity?.daysToPlacement != null && profile.identity.daysToPlacement <= 30) impact += 10;
  if (rec.urgency > 70) impact += 5;

  return Math.min(100, impact);
}

module.exports = { computeV2Scores };
