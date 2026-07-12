/**
 * RBAC tier middleware.
 * Usage: router.get('/premium-route', verifyToken, checkTier('pro'), handler)
 *
 * Tier hierarchy: max > pro > trial > free
 */

const User = require('../models/User');

const TIER_RANK = { free: 0, trial: 1, pro: 2, max: 3 };

function checkTier(minTier) {
  return async (req, res, next) => {
    try {
      // Always re-fetch tier from DB so admin changes take effect immediately
      const user = await User.findById(req.user.userId).select('tier tierExpiresAt').lean();
      if (!user) return res.status(401).json({ message: 'User not found' });

      // Auto-expire trial/pro/max if past expiry date
      let tier = user.tier;
      if (user.tierExpiresAt && new Date() > user.tierExpiresAt) {
        tier = 'free';
        // Downgrade in DB asynchronously
        User.findByIdAndUpdate(req.user.userId, { tier: 'free' }).catch(() => {});
      }

      const userRank = TIER_RANK[tier] ?? 0;
      const requiredRank = TIER_RANK[minTier] ?? 0;

      if (userRank < requiredRank) {
        return res.status(403).json({
          message: `This feature requires a ${minTier} plan.`,
          requiredTier: minTier,
          currentTier: tier,
          upgradeUrl: '/subscribe',
        });
      }

      req.user.tier = tier;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = checkTier;
