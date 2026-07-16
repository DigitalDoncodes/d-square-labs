const AiUsage = require('../models/AiUsage');
const { canAccessFeature } = require('../subscription/permissionEngine');
const { FEATURE } = require('../subscription/featureRegistry');
const { todayKey, DAILY_AI_LIMITS } = require('../utils/quota');

async function aiQuota(req, res, next) {
  try {
    if (canAccessFeature(req.user, FEATURE.ADMIN_STUDIO)) return next();

    const limit = DAILY_AI_LIMITS[req.user.tier];
    if (!limit) {
      return res.status(403).json({
        message: 'AI features require a trial, Pro or Max plan.',
        upgradeUrl: '/subscribe',
      });
    }

    const dateKey = todayKey();
    const filter = { user: req.user.userId, dateKey, count: { $lt: limit } };
    const usage = await AiUsage.findOneAndUpdate(
      filter,
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).catch(async (err) => {
      if (err.code === 11000) {
        return AiUsage.findOneAndUpdate(filter, { $inc: { count: 1 } }, { new: true });
      }
      throw err;
    });

    if (!usage) {
      return res.status(429).json({
        message: `Daily AI limit reached (${limit} actions on your plan). Resets at midnight UTC.`,
        limit,
        upgradeUrl: '/subscribe',
      });
    }

    res.set('X-AI-Used', String(usage.count));
    res.set('X-AI-Limit', String(limit));
    next();
  } catch (err) {
    next(err);
  }
}

aiQuota.DAILY_LIMIT = DAILY_AI_LIMITS;
aiQuota.todayKey = todayKey;
module.exports = aiQuota;
