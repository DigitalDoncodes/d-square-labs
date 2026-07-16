const Recommendation = require('../../models/Recommendation');

const VALID_TRANSITIONS = {
  generated: ['seen', 'regenerated', 'expired'],
  seen: ['accepted', 'ignored', 'regenerated', 'expired'],
  accepted: ['started', 'dismissed', 'regenerated', 'expired'],
  started: ['completed', 'dismissed', 'regenerated', 'expired'],
  completed: ['regenerated'],
  dismissed: ['regenerated'],
  ignored: ['seen', 'regenerated'],
  expired: ['regenerated'],
  regenerated: ['seen', 'expired'],
};

async function transition(userId, recId, toState) {
  const rec = await Recommendation.findOne({ _id: recId, user: userId });
  if (!rec) return null;

  const current = rec.lifecycle?.state || 'generated';
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(toState)) {
    return { error: `Cannot transition from "${current}" to "${toState}"` };
  }

  const timestamp = new Date();
  const transition = { from: current, to: toState, at: timestamp };

  const update = {
    'lifecycle.state': toState,
    $push: { 'lifecycle.transitions': transition },
  };

  switch (toState) {
    case 'seen':
      update['lifecycle.firstSeenAt'] = timestamp;
      break;
    case 'accepted':
      update['lifecycle.acceptedAt'] = timestamp;
      break;
    case 'started':
      update['lifecycle.startedAt'] = timestamp;
      break;
    case 'completed':
      update['lifecycle.completedAt'] = timestamp;
      update.dismissed = false;
      break;
    case 'dismissed':
      update['lifecycle.dismissedAt'] = timestamp;
      update.dismissed = true;
      break;
  }

  return Recommendation.findOneAndUpdate(
    { _id: recId, user: userId },
    update,
    { new: true }
  ).lean();
}

async function getState(userId, recId) {
  const rec = await Recommendation.findOne({ _id: recId, user: userId })
    .select('lifecycle')
    .lean();
  return rec?.lifecycle || null;
}

async function getByState(userId, state, limit = 20) {
  return Recommendation.find({
    user: userId,
    'lifecycle.state': state,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function expireOld(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const cutoff = new Date(Date.now() - maxAgeMs);
  return Recommendation.updateMany(
    {
      'lifecycle.state': { $in: ['generated', 'seen', 'ignored'] },
      createdAt: { $lt: cutoff },
    },
    {
      'lifecycle.state': 'expired',
      $push: { 'lifecycle.transitions': { to: 'expired', at: new Date() } },
    }
  );
}

async function markSeen(userId, recIds) {
  const now = new Date();
  return Recommendation.updateMany(
    { _id: { $in: recIds }, user: userId, 'lifecycle.state': 'generated' },
    {
      'lifecycle.state': 'seen',
      'lifecycle.firstSeenAt': now,
      $push: { 'lifecycle.transitions': { from: 'generated', to: 'seen', at: now } },
    }
  );
}

module.exports = {
  transition,
  getState,
  getByState,
  expireOld,
  markSeen,
  VALID_TRANSITIONS,
};
