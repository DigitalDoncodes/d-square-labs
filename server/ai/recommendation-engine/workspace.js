const engine = require('./index');

async function getWorkspaceRecommendations(userId, limit = 5) {
  if (!userId) return [];

  try {
    const active = await engine.getActiveRecommendations(userId);

    return active
      .filter((r) => r.urgency >= 40 || r.type === 'focus' || r.type === 'priority')
      .slice(0, limit)
      .map((r) => ({
        id: r._id,
        type: r.type,
        title: r.title,
        description: r.description,
        urgency: r.urgency,
        confidence: r.confidence,
        actions: (r.actions || []).slice(0, 1),
      }));
  } catch {
    return [];
  }
}

async function getQuickActions(userId, limit = 3) {
  if (!userId) return [];

  try {
    const active = await engine.getActiveRecommendations(userId);

    return active
      .filter((r) => r.actions?.length && r.type !== 'focus')
      .slice(0, limit)
      .map((r) => ({
        label: r.actions[0].label,
        route: r.actions[0].route,
        reason: r.reason.slice(0, 120),
        urgency: r.urgency,
      }));
  } catch {
    return [];
  }
}

async function getFocusBanner(userId) {
  if (!userId) return null;

  try {
    const active = await engine.getActiveRecommendations(userId);
    const focus = active.find((r) => r.type === 'focus');
    if (!focus) return null;

    return {
      title: focus.title,
      description: focus.description,
      confidence: focus.confidence,
    };
  } catch {
    return null;
  }
}

module.exports = {
  getWorkspaceRecommendations,
  getQuickActions,
  getFocusBanner,
};
