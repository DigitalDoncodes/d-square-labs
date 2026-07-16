const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile) return [];

  const s = [];
  const planner = profile.planner || {};
  const scores = profile.scores;
  const identity = profile.identity || {};
  const memory = profile.memory || {};

  // Career pivot plan
  if (planner.hasPivotPlan) {
    const gaps = planner.skillGaps || [];
    const criticalGaps = gaps.filter((g) => g.status === 'pending' || !g.status);

    if (criticalGaps.length) {
      s.push(createRecommendation({
        type: 'planner-suggestion',
        title: `Bridge ${criticalGaps.length} Skill Gap${criticalGaps.length > 1 ? 's' : ''} for Career Pivot`,
        description: `Your pivot from ${planner.fromDomain || 'current'} to ${planner.toDomain || 'target'} requires ${criticalGaps.map((g) => g.skill).join(', ')}. Focus on these first.`,
        reason: `${criticalGaps.length} skill gap${criticalGaps.length > 1 ? 's' : ''} identified in your career pivot plan. Closing gaps is critical for successful transition.`,
        confidence: 80,
        urgency: scores?.careerReadiness != null && scores.careerReadiness < 60 ? 70 : 45,
        expectedImpact: 'Accelerates career transition and target role readiness.',
        estimatedCompletionTime: 'Varies by skill — start with 30 min research',
        sourceSignals: ['pivot-plan-active', ...criticalGaps.map((g) => `skill-gap-${g.skill}`)],
        actions: [{ label: 'View Pivot Plan', route: '/pivot' }],
      }));
    }

    if (!criticalGaps.length && planner.targetCompanies?.length) {
      s.push(createRecommendation({
        type: 'planner-suggestion',
        title: 'Research Target Companies for Pivot',
        description: `Your pivot targets ${planner.toDomain}. Research ${planner.targetCompanies.slice(0, 3).join(', ')} to understand role requirements and prepare applications.`,
        reason: 'Skill gaps are addressed; next step is company-specific preparation for the career pivot.',
        confidence: 70,
        urgency: 40,
        expectedImpact: 'Aligns preparation with target company expectations.',
        estimatedCompletionTime: '20 min per company',
        sourceSignals: ['pivot-plan-complete', 'target-companies'],
        actions: [{ label: 'Research Companies', route: '/companies' }],
      }));
    }
  }

  // No pivot plan but has career interests
  if (!planner.hasPivotPlan && (memory.targetRoles?.length || identity.dreamRole)) {
    s.push(createRecommendation({
      type: 'planner-suggestion',
      title: 'Create a Career Pivot Plan',
      description: `You've expressed interest in ${memory.targetRoles?.slice(0, 2).join(', ') || identity.dreamRole || 'MBA roles'}. A structured pivot plan maps your transition from current skills to target role.`,
      reason: 'No pivot plan exists despite expressed career interests. Structured planning increases placement success rate.',
      confidence: 70,
      urgency: scores?.careerReadiness != null && scores.careerReadiness < 50 ? 60 : 35,
      expectedImpact: 'Provides structured pathway from current state to target role.',
      estimatedCompletionTime: '20–30 min',
      sourceSignals: ['no-pivot-plan', ...(memory.targetRoles?.length ? ['target-roles-defined'] : [])],
      actions: [{ label: 'Create Pivot Plan', route: '/pivot' }],
    }));
  }

  // Active projects
  if (planner.activeProjects > 0) {
    const nearDeadlines = planner.projectDeadlines?.filter((p) => {
      if (!p.deadline) return false;
      return Math.ceil((new Date(p.deadline) - new Date()) / 86400000) <= 7;
    });
    if (nearDeadlines?.length) {
      s.push(createRecommendation({
        type: 'planner-suggestion',
        title: `Project Deadline${nearDeadlines.length > 1 ? 's' : ''} Approaching`,
        description: nearDeadlines.map((p) => `• ${p.title} (due ${new Date(p.deadline).toLocaleDateString()})`).join('\n'),
        reason: `${nearDeadlines.length} project${nearDeadlines.length > 1 ? 's have' : ' has'} deadlines within 7 days. Group project coordination requires advance planning.`,
        confidence: 80,
        urgency: 65,
        expectedImpact: 'Ensures timely project delivery and team coordination.',
        estimatedCompletionTime: '1–2 hours',
        sourceSignals: nearDeadlines.map((p) => `project-${p.title.toLowerCase().replace(/\s+/g, '-')}`),
        actions: [{ label: 'View Projects', route: '/projects' }],
      }));
    }
  }

  return s;
}

module.exports = { generate };
