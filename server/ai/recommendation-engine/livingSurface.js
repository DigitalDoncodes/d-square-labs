const RecommendationStream = require('../../models/RecommendationStream');
const engine = require('./index');
const { generateDailyMission } = require('./dailyMission');

async function hydrateStream(userId) {
  if (!userId) return null;

  const active = await engine.getActiveRecommendations(userId);

  const focus = active.find((r) => r.type === 'focus');
  const priorities = active.filter((r) => r.type === 'priority').slice(0, 3);

  const entries = active.map((r) => ({
    recommendation: r._id,
    type: r.type,
    title: r.title,
    description: r.description,
    reason: r.reason,
    confidence: r.confidence,
    urgency: r.urgency,
    expectedImpact: r.expectedImpact,
    estimatedCompletionTime: r.estimatedCompletionTime,
    sourceSignals: r.sourceSignals,
    actions: r.actions,
    dismissed: r.dismissed || false,
    lifecycleState: r.lifecycle?.state,
    v2Scores: r.v2Scores ? { composite: r.v2Scores.composite } : undefined,
    goalAlignment: r.goalAlignment,
  }));

  let dailyMission = null;
  try {
    const existingStream = await RecommendationStream.findOne({ user: userId }).lean();
    if (existingStream?.dailyMission) {
      const missionAge = Date.now() - new Date(existingStream.dailyMission.generatedAt).getTime();
      if (missionAge < 60 * 60 * 1000) {
        dailyMission = existingStream.dailyMission;
      }
    }
  } catch {
    // ignore
  }

  if (!dailyMission) {
    try {
      const profile = await _getProfileFor(userId);
      dailyMission = await generateDailyMission(userId, active, profile);
    } catch {
      // daily mission is optional
    }
  }

  const stream = await RecommendationStream.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      todayFocus: focus?.title || null,
      topPriorities: priorities.map((p) => p.title),
      entries,
      dailyMission,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  ).lean();

  return stream;
}

async function getStream(userId) {
  if (!userId) return null;

  try {
    const stream = await RecommendationStream.findOne({ user: userId }).lean();
    if (!stream) return null;

    const age = Date.now() - new Date(stream.generatedAt).getTime();
    if (age > 60 * 60 * 1000) {
      return hydrateStream(userId);
    }

    return stream;
  } catch {
    return null;
  }
}

async function getStreamSummary(userId) {
  const stream = await getStream(userId);
  if (!stream) return { todayFocus: null, topPriorities: [], entryCount: 0 };

  return {
    todayFocus: stream.todayFocus,
    topPriorities: stream.topPriorities,
    entryCount: stream.entries?.length || 0,
    generatedAt: stream.generatedAt,
    hasDailyMission: !!stream.dailyMission,
  };
}

async function attachDailyMission(userId, mission) {
  if (!userId || !mission) return null;
  try {
    return await RecommendationStream.findOneAndUpdate(
      { user: userId },
      { dailyMission: mission },
      { upsert: true, new: true }
    ).lean();
  } catch {
    return null;
  }
}

async function getDailyMission(userId) {
  if (!userId) return null;
  try {
    const stream = await RecommendationStream.findOne({ user: userId })
      .select('dailyMission')
      .lean();
    return stream?.dailyMission || null;
  } catch {
    return null;
  }
}

async function _getProfileFor(userId) {
  try {
    const intelligenceLayer = require('../intelligence-layer');
    return await intelligenceLayer.buildStudentProfile(userId);
  } catch {
    return null;
  }
}

module.exports = {
  hydrateStream,
  getStream,
  getStreamSummary,
  attachDailyMission,
  getDailyMission,
};
