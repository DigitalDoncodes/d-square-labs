const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { heavyLimiter } = require('../middleware/rateLimiters');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const User = require('../models/User');

const PRICES = { pro: 299, max: 499 };

// POST /api/subscription/request — submit a payment reference for review
router.post('/request', verifyToken, heavyLimiter, async (req, res, next) => {
  try {
    const { tier, paymentRef, upiId, note } = req.body;

    if (!['pro', 'max'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier. Must be pro or max.' });
    }
    if (!paymentRef?.trim()) {
      return res.status(400).json({ message: 'Payment reference number is required.' });
    }

    // Prevent duplicate pending requests for the same ref
    const existing = await SubscriptionRequest.findOne({
      paymentRef: paymentRef.trim(),
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ message: 'This payment reference is already submitted and pending review.' });
    }

    const request = await SubscriptionRequest.create({
      user: req.user.userId,
      tier,
      amountPaid: PRICES[tier],
      paymentRef: paymentRef.trim(),
      upiId: upiId?.trim() || undefined,
      note: note?.trim() || undefined,
    });

    res.status(201).json({
      message: 'Payment reference submitted. The admin will verify and activate your plan within 24 hours.',
      requestId: request._id,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscription/me — current user's requests + tier
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const [user, requests] = await Promise.all([
      User.findById(req.user.userId).select('tier tierExpiresAt trialStartedAt subscriptionRef').lean(),
      SubscriptionRequest.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    // Lazily downgrade an expired plan so the client always sees the real state
    let tier = user?.tier || 'free';
    let tierExpiresAt = user?.tierExpiresAt || null;
    if (tier !== 'free' && tierExpiresAt && new Date() > new Date(tierExpiresAt)) {
      tier = 'free';
      tierExpiresAt = null;
      User.findByIdAndUpdate(req.user.userId, { tier: 'free', tierExpiresAt: null }).catch(() => {});
    }

    // Today's metered AI usage so the client can show "X of Y AI actions".
    const aiQuota = require('../middleware/aiQuota');
    const AiUsage = require('../models/AiUsage');
    const limit = aiQuota.DAILY_LIMIT[tier] ?? 0;
    const usage = limit
      ? await AiUsage.findOne({ user: req.user.userId, dateKey: aiQuota.todayKey() }).select('count').lean()
      : null;

    res.json({
      tier,
      tierExpiresAt,
      trialUsed: !!user?.trialStartedAt,
      requests,
      aiUsage: { used: usage?.count || 0, limit },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscription/trial — self-service 7-day trial activation
router.post('/trial', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('tier trialStartedAt').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check trialStartedAt first — once used, it's used regardless of current tier
    if (user.trialStartedAt) {
      return res.status(400).json({ message: 'You have already used your free trial.' });
    }
    // Legacy accounts predate the tier field — treat missing as 'free'.
    if ((user.tier || 'free') !== 'free') {
      return res.status(400).json({ message: 'Trial is only available on the free plan. Downgrade first if you want to try again.' });
    }

    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(req.user.userId, {
      tier: 'trial',
      trialStartedAt: new Date(),
      tierExpiresAt: trialEnd,
    });

    res.json({ message: 'Trial activated! You have 7 days of Pro features.', expiresAt: trialEnd });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
