const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile) return [];

  const priorities = [];

  const tasks = profile.tasks;
  const career = profile.career;
  const learning = profile.learning;
  const scores = profile.scores;

  // Priority 1: Overdue tasks
  if (tasks?.overdue > 0) {
    const count = tasks.overdue;
    priorities.push(createRecommendation({
      type: 'priority',
      title: `Complete ${count} Overdue Task${count > 1 ? 's' : ''}`,
      description: `${count} task${count > 1 ? 's are' : ' is'} past due. Clear these first to prevent further compounding.`,
      reason: `Detected ${count} overdue task${count > 1 ? 's' : ''} from task collector. Overdue tasks increase stress and reduce flexibility.`,
      confidence: Math.min(95, 70 + count * 5),
      urgency: Math.min(100, 50 + count * 15),
      expectedImpact: 'Reduces stress, prevents escalation, frees up calendar.',
      estimatedCompletionTime: count <= 2 ? '30–60 min' : '1–2 hours',
      sourceSignals: [`overdue-count-${count}`, 'task-collector'],
      actions: [{ label: 'View Tasks', route: '/tasks' }],
    }));
  }

  // Priority 2: Near deadlines
  if (tasks?.upcomingDeadlines?.length) {
    const near = tasks.upcomingDeadlines.filter((d) => {
      if (!d.dueDate) return false;
      const days = Math.ceil((new Date(d.dueDate) - new Date()) / 86400000);
      return days >= 0 && days <= 3;
    });
    if (near.length) {
      priorities.push(createRecommendation({
        type: 'priority',
        title: `Prepare for ${near.length} Near Deadline${near.length > 1 ? 's' : ''}`,
        description: near.map((d) => `${d.title} (due ${new Date(d.dueDate).toLocaleDateString()})`).join('; '),
        reason: `${near.length} task${near.length > 1 ? 's have' : ' has'} deadlines within 3 days. Early preparation avoids last-minute rush.`,
        confidence: 85,
        urgency: Math.min(95, 40 + near.length * 15),
        expectedImpact: 'Ensures on-time submission, reduces stress.',
        estimatedCompletionTime: '1–2 hours',
        sourceSignals: [`near-deadlines-${near.length}`],
        actions: [{ label: 'View Deadlines', route: '/tasks' }],
      }));
    }
  }

  // Priority 3: Placement readiness
  if (scores?.careerReadiness != null && scores.careerReadiness < 60) {
    priorities.push(createRecommendation({
      type: 'priority',
      title: 'Improve Placement Readiness',
      description: `Your placement readiness score is ${scores.careerReadiness}/100. ${career?.hasResume === false ? 'Start by uploading your resume.' : 'Focus on company research and mock interviews.'}`,
      reason: `Readiness score ${scores.careerReadiness} is below the 60 threshold. ${profile?.identity?.daysToPlacement != null ? `Only ${profile.identity.daysToPlacement} days until placement season.` : ''}`,
      confidence: 80,
      urgency: profile?.identity?.daysToPlacement != null && profile.identity.daysToPlacement <= 60 ? 80 : 50,
      expectedImpact: 'Increases placement confidence and preparedness.',
      estimatedCompletionTime: 'Ongoing — 30 min daily',
      sourceSignals: [`career-readiness-${scores.careerReadiness}`, profile?.identity?.daysToPlacement != null ? `days-to-placement-${profile.identity.daysToPlacement}` : ''].filter(Boolean),
      actions: [
        { label: 'Company Research', route: '/companies' },
        { label: 'View Resume', route: '/resume' },
      ],
    }));
  }

  // Priority 4: Study consistency
  if (learning?.consistency != null && learning.consistency < 40 && learning.daysTracked >= 3) {
    priorities.push(createRecommendation({
      type: 'priority',
      title: 'Build Consistent Study Habits',
      description: `Your study consistency is ${learning.consistency}% over the past week. Try to study at least 30 minutes daily to build momentum.`,
      reason: `Consistency ${learning.consistency}% is below the 40% threshold. Inconsistent study patterns reduce information retention.`,
      confidence: 75,
      urgency: 40,
      expectedImpact: 'Improves learning velocity and topic mastery.',
      estimatedCompletionTime: '30 min daily',
      sourceSignals: [`consistency-${learning.consistency}`, 'habit-collector'],
      actions: [{ label: 'Track Study', route: '/study-tools' }],
    }));
  }

  return priorities.slice(0, 3);
}

module.exports = { generate };
