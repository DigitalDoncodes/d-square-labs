const { buildProfile, createEmptyProfile } = require('./profileFactory');
const { computeScores } = require('./scoringEngine');

const identityCollector = require('./collectors/identityCollector');
const memoryCollector = require('./collectors/memoryCollector');
const taskCollector = require('./collectors/taskCollector');
const noteCollector = require('./collectors/noteCollector');
const plannerCollector = require('./collectors/plannerCollector');
const careerCollector = require('./collectors/careerCollector');
const learningCollector = require('./collectors/learningCollector');
const activityCollector = require('./collectors/activityCollector');
const stressCollector = require('./collectors/stressCollector');

async function buildStudentProfile(userId) {
  if (!userId) return createEmptyProfile(null);

  try {
    const [
      identity,
      memory,
      tasks,
      notes,
      planner,
      career,
      learning,
      activity,
      stress,
    ] = await Promise.all([
      identityCollector.collect(userId),
      memoryCollector.collect(userId),
      taskCollector.collect(userId),
      noteCollector.collect(userId),
      plannerCollector.collect(userId),
      careerCollector.collect(userId),
      learningCollector.collect(userId),
      activityCollector.collect(userId),
      stressCollector.collect(userId),
    ]);

    const collected = { identity, memory, tasks, notes, planner, career, learning, activity, stress };
    const scores = computeScores(collected);

    return buildProfile(userId, collected, scores);
  } catch (err) {
    console.warn('[intelligence-layer] Failed to build profile:', err.message);
    return createEmptyProfile(userId);
  }
}

async function getIntelligence(userId) {
  const profile = await buildStudentProfile(userId);
  return {
    scores: profile.scores,
    enrichedContext: profile.enrichedContext,
  };
}

module.exports = {
  buildStudentProfile,
  getIntelligence,
};
