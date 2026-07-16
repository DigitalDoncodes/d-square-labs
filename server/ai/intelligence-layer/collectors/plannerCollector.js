const PivotPlan = require('../../../models/PivotPlan');
const Project = require('../../../models/Project');

async function collect(userId) {
  try {
    const [pivotPlan, projects] = await Promise.all([
      PivotPlan.findOne({ user: userId }).lean().catch(() => null),
      Project.find({ $or: [{ createdBy: userId }, { members: userId }] })
        .sort({ deadline: 1 })
        .limit(10)
        .lean()
        .catch(() => []),
    ]);

    const activeProjects = projects.filter((p) => p.status === 'active');

    return {
      hasPivotPlan: !!pivotPlan,
      fromDomain: pivotPlan?.fromDomain || null,
      toDomain: pivotPlan?.toDomain || null,
      skillGaps: pivotPlan?.skillGaps || [],
      targetCompanies: pivotPlan?.targetCompanies || [],
      activeProjects: activeProjects.length,
      projectDeadlines: activeProjects.map((p) => ({ title: p.title, deadline: p.deadline })),
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
