const { run } = require('../../ai/runner');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const ResumeTip = require('../../models/ResumeTip');
const cfg = require('../../config/automation');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function generateResumeTip() {
  return runJob('resume-tip-generation', async () => {
    const dateStr = todayKey();

    const existing = await ResumeTip.findOne({ dateKey: dateStr });
    if (existing) {
      console.log(`[resume-tip] Tip for ${dateStr} already exists — skipping`);
      return { itemsProcessed: 0, meta: { skipped: true } };
    }

    // Get recent tips to avoid repetition
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cfg.content.resumeTipDeduplicationDays);
    const recentTips = await ResumeTip.find({ createdAt: { $gte: cutoff } })
      .select('category title')
      .lean();

    const recentSummary = recentTips
      .map((t) => `• [${t.category}] ${t.title}`)
      .join('\n');

    const prompt = PROMPTS.resumeTip({ recentTips: recentSummary });
    const { result, meta } = await run({ system: prompt.system, user: prompt.user, json: true });

    await ResumeTip.create({
      dateKey: dateStr,
      category: result.category || 'general',
      title: result.title,
      tip: result.tip,
      example: result.example,
      applicableTo: result.applicableTo,
      generatedBy: meta.provider,
      model: meta.model,
      tokensUsed: meta.tokensUsed,
      status: 'published',
    });

    return { provider: meta.provider, model: meta.model, tokensUsed: meta.tokensUsed, itemsProcessed: 1 };
  });
}

module.exports = { generateResumeTip };
