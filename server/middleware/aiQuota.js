/**
 * Daily fair-use metering for on-demand AI actions (LLM calls).
 * Use AFTER checkTier, which resolves the effective tier onto req.user.tier:
 *   router.post('/x', verifyToken, checkTier('trial'), aiQuota, handler)
 *
 * "Unlimited AI" in the pricing copy means these caps — high enough that a
 * real student never hits them, low enough that one account can't drain the
 * provider key. Chat has its own per-message quota in chatRoutes.
 */
const AiUsage = require('../models/AiUsage');

const DAILY_LIMIT = { trial: 10, pro: 75, max: 250 };

const todayKey = () => new Date().toISOString().slice(0, 10);

async function aiQuota(req, res, next) {
  try {
    // Admins bypass metering (they trigger AI for content curation).
    if (req.user.role === 'admin') return next();

    const limit = DAILY_LIMIT[req.user.tier];
    if (limit === undefined) {
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
      // E11000: the row already exists but the $lt filter excluded it —
      // either the user is over the limit, or a concurrent request created
      // the row first. Retry once without upsert to tell them apart.
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

aiQuota.DAILY_LIMIT = DAILY_LIMIT;
aiQuota.todayKey = todayKey;
module.exports = aiQuota;
