const { runPipeline } = require('../../ai/agents/pipeline');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const DailyBriefing = require('../../models/DailyBriefing');
const NewsItem = require('../../models/NewsItem');
const { getRecentNews } = require('../../ai/retriever');
const User = require('../../models/User');
const { notifyBulk } = require('../../controllers/notificationController');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function generateDailyBriefing() {
  return runJob('daily-briefing-generation', async () => {
    const dateStr = todayKey();

    const existing = await DailyBriefing.findOne({ dateKey: dateStr });
    if (existing) {
      console.log(`[daily-briefing] Briefing for ${dateStr} already exists — skipping`);
      return { itemsProcessed: 0, meta: { skipped: true } };
    }

    // RAG: retrieve recent news as grounding context
    const newsCtx = await getRecentNews(null, 15);
    const recentHeadlines = newsCtx?.text || '';
    const sourceCount = newsCtx?.raw?.length || 0;

    const prompt = PROMPTS.dailyBriefing({ dateStr, recentHeadlines });
    const { result, meta, validation } = await runPipeline({
      task: 'daily-briefing',
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      ragContext: recentHeadlines,
      sourceCount,
    });

    await DailyBriefing.create({
      dateKey: dateStr,
      headline: result.headline,
      sections: result.sections || {},
      interviewTip: result.interviewTip,
      keyNumbers: result.keyNumbers || [],
      mustKnowTerm: result.mustKnowTerm || {},
      generatedBy: meta.provider,
      model: meta.model,
      tokensUsed: meta.tokensUsed,
      confidence: meta.confidence,
      status: meta.status || 'published',
    });

    User.find({ status: 'approved', role: { $ne: 'admin' } }).select('_id').lean().then((users) => {
      notifyBulk(users.map((u) => u._id), { type: 'general', title: 'Daily briefing is ready', body: result.headline, link: '/briefing' });
    }).catch(() => {});

    return {
      provider: meta.provider,
      model: meta.model,
      tokensUsed: meta.tokensUsed,
      estimatedCostUsd: meta.estimatedCostUsd,
      confidence: meta.confidence,
      validationStatus: meta.status,
      ragSourceCount: sourceCount,
      itemsProcessed: 1,
    };
  });
}

module.exports = { generateDailyBriefing };
