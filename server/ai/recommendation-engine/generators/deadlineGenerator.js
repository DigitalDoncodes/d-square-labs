const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.tasks) return [];

  const tasks = profile.tasks;
  const stress = profile.stress || {};
  const suggestions = [];

  if (tasks.upcomingDeadlines?.length) {
    const urgent = tasks.upcomingDeadlines.filter((d) => {
      if (!d.dueDate) return false;
      const days = Math.ceil((new Date(d.dueDate) - new Date()) / 86400000);
      return days >= 0 && days <= 2;
    });

    const thisWeek = tasks.upcomingDeadlines.filter((d) => {
      if (!d.dueDate) return false;
      if (urgent.includes(d)) return false;
      const days = Math.ceil((new Date(d.dueDate) - new Date()) / 86400000);
      return days >= 0 && days <= 7;
    });

    if (urgent.length) {
      suggestions.push(createRecommendation({
        type: 'deadline-alert',
        title: `Urgent: ${urgent.length} Deadline${urgent.length > 1 ? 's' : ''} Within 48 Hours`,
        description: urgent.map((d) => `• ${d.title} (${new Date(d.dueDate).toLocaleDateString()})`).join('\n'),
        reason: `${urgent.length} task${urgent.length > 1 ? 's have' : ' has'} deadlines within 48 hours. Immediate action required to avoid overdue status.`,
        confidence: 95,
        urgency: Math.min(100, 70 + urgent.length * 10),
        expectedImpact: 'Prevents overdue tasks and reduces stress.',
        estimatedCompletionTime: urgent.length <= 2 ? '1–2 hours' : '2–4 hours',
        sourceSignals: urgent.map((d) => `deadline-${d.title.toLowerCase().replace(/\s+/g, '-')}`),
        actions: [{ label: 'View Tasks', route: '/tasks' }],
      }));
    }

    if (thisWeek.length) {
      suggestions.push(createRecommendation({
        type: 'deadline-alert',
        title: `${thisWeek.length} Deadline${thisWeek.length > 1 ? 's' : ''} This Week`,
        description: thisWeek.map((d) => `• ${d.title} (${new Date(d.dueDate).toLocaleDateString()})`).join('\n'),
        reason: `${thisWeek.length} upcoming deadline${thisWeek.length > 1 ? 's' : ''} within 7 days. Planning ahead reduces last-minute pressure.`,
        confidence: 85,
        urgency: 50 + thisWeek.length * 8,
        expectedImpact: 'Enables proactive planning and reduces stress.',
        estimatedCompletionTime: 'Varies — plan 30 min for scheduling',
        sourceSignals: thisWeek.map((d) => `deadline-${d.title.toLowerCase().replace(/\s+/g, '-')}`),
        actions: [{ label: 'Plan Week', route: '/tasks' }],
      }));
    }
  }

  if (tasks.overdue > 0) {
    suggestions.push(createRecommendation({
      type: 'deadline-alert',
      title: `${tasks.overdue} Overdue Task${tasks.overdue > 1 ? 's' : ''} — Review and Reschedule`,
      description: `${tasks.overdue} task${tasks.overdue > 1 ? 's are' : ' is'} past due. Review each one: can they be completed today, or should they be rescheduled?`,
      reason: `${tasks.overdue} overdue task${tasks.overdue > 1 ? 's' : ''} detected. Overdue tasks compound stress and may impact placement preparation.`,
      confidence: 90,
      urgency: Math.min(95, 50 + tasks.overdue * 10),
      expectedImpact: 'Clearing overdue tasks reduces cognitive load and stress.',
      estimatedCompletionTime: `${tasks.overdue <= 3 ? '30 min' : '1–2 hours'}`,
      sourceSignals: [`overdue-count-${tasks.overdue}`, stress.stressLevel > 50 ? `stress-${stress.stressLevel}` : ''].filter(Boolean),
      actions: [{ label: 'Review Tasks', route: '/tasks' }],
    }));
  }

  return suggestions;
}

module.exports = { generate };
