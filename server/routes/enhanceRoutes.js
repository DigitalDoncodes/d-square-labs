const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { generalLimiter } = require('../middleware/rateLimiters');
const { getMinimumTier, FEATURE } = require('../subscription/featureRegistry');
const { canAccessFeature, refreshTier } = require('../subscription/permissionEngine');
const usageMeter = require('../ai/usageMeter');
const { enhance } = require('../ai/runtime-v2/studentIntelligenceEngine');

const ENHANCE_FEATURES = {
  'dashboard:view': null,
  'dashboard:detect-problems': null,
  'dashboard:recommend': null,
  'planner:optimize': FEATURE.AI_PLANNER_SUGGEST,
  'notes:summarize': FEATURE.AI_SUMMARISE,
  'notes:flashcard': FEATURE.FLASHCARD_GENERATE,
  'notes:quiz': FEATURE.QUIZ_GENERATE,
  'resume:ats': FEATURE.RESUME_ATS,
  'resume:review': FEATURE.AI_RESUME_REVIEW,
  'finance:advise': FEATURE.FINANCE_ASSIST,
  'career:roadmap': FEATURE.AI_CAREER_ADVICE,
  'interview:coach': FEATURE.AI_INTERVIEW_SIMULATOR,
  'company:research': FEATURE.COMPANY_RESEARCH,
  'compare:companies': FEATURE.AI_COMPARE_COMPANIES,
  'recommend:next': null,
};

const ENHANCE_QUOTA = new Set([
  'planner:optimize', 'notes:summarize', 'notes:flashcard',
  'notes:quiz', 'resume:ats', 'resume:review',
  'finance:advise', 'career:roadmap', 'interview:coach',
  'company:research', 'compare:companies',
]);

router.use(verifyToken);
router.use(refreshTier);
router.use(generalLimiter);

router.post('/', async (req, res, next) => {
  try {
    const { page, action, data = {} } = req.body;
    if (!page || !action) {
      return res.status(400).json({ message: 'page and action are required' });
    }

    const pageAction = `${page}:${action}`;
    const feature = ENHANCE_FEATURES[pageAction];

    if (feature && !canAccessFeature(req.user, feature)) {
      const minTier = getMinimumTier(feature);
      return res.status(403).json({
        message: `This feature requires ${minTier === 'max' ? 'Max' : minTier === 'pro' ? 'Pro' : minTier === 'trial' ? 'a trial' : 'an upgraded'} plan.`,
        requiredTier: minTier,
        upgradeUrl: '/subscribe',
      });
    }

    // Pre-flight credit gate — charging happens at the AI completion sites
    // (usageMeter.chargeCredits), weighted by which model actually served it.
    if (ENHANCE_QUOTA.has(pageAction) && req.user.role !== 'admin') {
      const credits = await usageMeter.checkCredits(req.user.userId, req.user.tier);
      if (credits.limit && credits.blocked) {
        return res.status(429).json({
          code: 'CREDITS_EXHAUSTED',
          message: `Daily AI credits used up (${credits.limit} on your plan). Resets at midnight UTC.`,
          credits,
          upgradeUrl: '/subscribe',
        });
      }
      if (credits.limit) {
        res.set('X-AI-Credits-Used', String(credits.used));
        res.set('X-AI-Credits-Limit', String(credits.limit));
      }
    }

    const result = await enhance({
      userId: req.user.userId,
      page,
      action,
      data,
      tier: req.user.tier,
    });

    res.json(result);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(err.statusCode || 400).json({ message: err.message });
    if (err.message === 'AI not configured') return res.status(503).json({ message: 'AI features are not enabled on this server' });
    next(err);
  }
});

module.exports = router;
