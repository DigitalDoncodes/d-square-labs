const UserMemory = require('../../../models/UserMemory');

async function collect(userId) {
  try {
    const userMemory = await UserMemory.findOne({ user: userId }).lean().catch(() => null);
    if (!userMemory) return null;

    return {
      specialization: userMemory.specialization || null,
      careerInterests: userMemory.careerInterests || [],
      targetCompanies: userMemory.targetCompanies || [],
      targetRoles: userMemory.targetRoles || [],
      readinessScore: userMemory.readinessScore ?? null,
      resumeCompletionPct: userMemory.resumeCompletionPct ?? null,
      tasksCompletedCount: userMemory.tasksCompletedCount || 0,
      notesCount: userMemory.notesCount || 0,
      savedCompanies: userMemory.savedCompanies || [],
      recentTopics: userMemory.recentTopics || [],
      preferredExplanationStyle: userMemory.preferredExplanationStyle || 'concise',
      strengths: userMemory.strengths || [],
      weaknesses: userMemory.weaknesses || [],
      contextSummary: userMemory.contextSummary || null,
      lastRefresh: userMemory.lastFullRefresh || null,
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
