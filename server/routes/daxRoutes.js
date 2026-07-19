const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { generalLimiter } = require('../middleware/rateLimiters');
const { requireFeature, canAccessFeature, refreshTier } = require('../subscription/permissionEngine');
const { FEATURE } = require('../subscription/featureRegistry');
const AiUsage = require('../models/AiUsage');
const aiQuota = require('../middleware/aiQuota');
const { getMinimumTier } = require('../subscription/featureRegistry');
const daxService = require('../ai/daxService');
const UserModelPref = require('../models/UserModelPref');
const { getAvailableModels, getDefaultModelId, parseModelId } = require('../ai/modelList');

router.use(verifyToken);
router.use(refreshTier);
router.use(generalLimiter);

const TASK_FEATURES = {
  'summarise-note':       FEATURE.AI_SUMMARISE,
  'review-resume':        FEATURE.AI_RESUME_REVIEW,
  'planner-suggest':      FEATURE.AI_PLANNER_SUGGEST,
  'career-advice':        FEATURE.AI_CAREER_ADVICE,
  'interview-simulator':  FEATURE.AI_INTERVIEW_SIMULATOR,
  'compare-companies':    FEATURE.AI_COMPARE_COMPANIES,
  'flashcard-generate':   FEATURE.FLASHCARD_GENERATE,
  'quiz-generate':        FEATURE.QUIZ_GENERATE,
  'finance-assist':       FEATURE.FINANCE_ASSIST,
  'dashboard-insights':   FEATURE.DASHBOARD_INSIGHTS,
  'company-research':     FEATURE.COMPANY_RESEARCH,
  'resume-ats':           FEATURE.RESUME_ATS,
  search:                 FEATURE.SEMANTIC_SEARCH,
  'index-doc':            FEATURE.SEMANTIC_SEARCH,
};

const TASK_QUOTA = new Set([
  'summarise-note',
  'review-resume',
  'planner-suggest',
  'career-advice',
  'interview-simulator',
  'compare-companies',
  'flashcard-generate',
  'quiz-generate',
  'finance-assist',
  'dashboard-insights',
  'company-research',
  'resume-ats',
]);

router.post('/', async (req, res, next) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ message: 'task is required' });

    const feature = TASK_FEATURES[task];

    if (feature && !canAccessFeature(req.user, feature)) {
      const minTier = getMinimumTier(feature);
      return res.status(403).json({
        message: `This feature requires ${minTier === 'max' ? 'Max' : minTier === 'pro' ? 'Pro' : minTier === 'trial' ? 'a trial' : 'an upgraded'} plan.`,
        requiredTier: minTier,
        upgradeUrl: '/subscribe',
      });
    }

    if (TASK_QUOTA.has(task)) {
      const limit = aiQuota.DAILY_LIMIT;
      const dateKey = new Date().toISOString().slice(0, 10);
      const userLimit = limit[req.user.tier];
      if (userLimit) {
        const filter = { user: req.user.userId, dateKey, count: { $lt: userLimit } };
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
            message: `Daily AI limit reached (${userLimit} actions on your plan). Resets at midnight UTC.`,
            limit: userLimit,
            upgradeUrl: '/subscribe',
          });
        }
        res.set('X-AI-Used', String(usage.count));
        res.set('X-AI-Limit', String(userLimit));
      }
    }

    const result = await daxService.process(req.user.userId, task, req.body, req.user);

    if (result && result._error) {
      return res.status(result._error).json(result);
    }

    res.json(result);
  } catch (err) {
    if (err.name === 'NotFoundError') return res.status(err.statusCode).json({ message: err.message });
    if (err.name === 'ValidationError') return res.status(err.statusCode).json({ message: err.message });
    if (err.name === 'ForbiddenError') return res.status(err.statusCode).json({ message: err.message });
    if (err.message === 'AI not configured') return res.status(503).json({ message: 'AI features are not enabled on this server' });
    next(err);
  }
});

router.get('/memory', async (req, res, next) => {
  try {
    const result = await daxService.getMemory(req.user.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.patch('/memory', async (req, res, next) => {
  try {
    const result = await daxService.patchMemory(req.user.userId, req.body);
    res.json(result);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    next(err);
  }
});

router.delete('/memory', async (req, res, next) => {
  try {
    const result = await daxService.deleteMemory(req.user.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/chat/stream', async (req, res, next) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

  try {
    const controller = new AbortController();
    req.on('close', () => controller.abort());

    const gen = daxService.streamChat(req.user.userId, message, { signal: controller.signal });

    // Peek the first yield before committing to SSE headers — a quota-
    // exceeded turn resolves as the very first (and only) yield, so it can
    // still be answered as a plain JSON 429, matching the non-streaming
    // route's error contract instead of forcing SSE framing on every error.
    const first = await gen.next();
    if (first.done) return res.json({ reply: '', remaining: 0 });
    if (first.value.done && first.value._error) {
      return res.status(first.value._error).json(first.value);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const sendEvent = (type, data) => {
      if (res.destroyed) return;
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    let chunk = first.value;
    while (true) {
      if (chunk.done) {
        sendEvent('done', chunk);
        break;
      }
      sendEvent('token', chunk);
      const next = await gen.next();
      if (next.done) break;
      chunk = next.value;
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) return next(err);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
      res.end();
    } catch {}
  }
});

router.get('/chat/history', async (req, res, next) => {
  try {
    const result = await daxService.getChatHistory(req.user.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete('/chat', async (req, res, next) => {
  try {
    const result = await daxService.clearChat(req.user.userId);
    res.json(result);
  } catch (err) { next(err); }
});

// ── Model Preference ──────────────────────────────────────────

router.get('/models', (req, res) => {
  res.json({ models: getAvailableModels() });
});

router.get('/model/preference', async (req, res, next) => {
  try {
    const pref = await UserModelPref.findOne({ user: req.user.userId }).lean();
    if (pref) {
      res.json({ provider: pref.provider, model: pref.model });
    } else {
      const def = getDefaultModelId();
      const parsed = parseModelId(def);
      res.json({ provider: parsed.provider, model: parsed.model });
    }
  } catch (err) { next(err); }
});

router.put('/model/preference', async (req, res, next) => {
  try {
    const { modelId } = req.body;
    if (!modelId) return res.status(400).json({ message: 'modelId is required' });

    const parsed = parseModelId(modelId);
    if (!parsed) return res.status(400).json({ message: 'Invalid modelId format' });

    await UserModelPref.findOneAndUpdate(
      { user: req.user.userId },
      { provider: parsed.provider, model: parsed.model },
      { upsert: true, new: true }
    );

    res.json({ provider: parsed.provider, model: parsed.model });
  } catch (err) { next(err); }
});

module.exports = router;
