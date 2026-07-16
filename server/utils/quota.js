const { DAILY_AI_LIMITS, CHAT_QUOTAS } = require('../subscription/subscriptionService');

exports.todayKey = () => new Date().toISOString().slice(0, 10);

exports.DAILY_AI_LIMIT = DAILY_AI_LIMITS;
exports.DAILY_AI_LIMITS = DAILY_AI_LIMITS;
exports.CHAT_QUOTA = CHAT_QUOTAS;

exports.getEffectiveTier = async (userId) => {
  const { getEffectiveTier } = require('../subscription/permissionEngine');
  const User = require('../models/User');
  const user = await User.findById(userId).select('tier tierExpiresAt').lean();
  const effective = getEffectiveTier(user);
  return CHAT_QUOTAS[effective] !== undefined ? effective : 'free';
};
