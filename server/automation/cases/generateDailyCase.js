const { run } = require('../../ai/runner');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const DailyCase = require('../../models/DailyCase');

const CATEGORIES = ['strategy', 'marketing', 'operations', 'finance', 'hr', 'guesstimate'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pickCategory(dateStr) {
  // Rotate categories deterministically by date so students get variety
  const dayIndex = parseInt(dateStr.replace(/-/g, ''), 10) % CATEGORIES.length;
  return CATEGORIES[dayIndex];
}

function pickDifficulty(dateStr) {
  const dayOfWeek = new Date(dateStr).getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'easy';  // weekends lighter
  if (dayOfWeek === 5) return 'hard';                      // Friday challenge
  return 'medium';
}

async function generateDailyCase() {
  return runJob('daily-case-generation', async (log) => {
    const dateStr = todayKey();

    // Skip if today's case already exists
    const existing = await DailyCase.findOne({ dateKey: dateStr });
    if (existing) {
      console.log(`[daily-case] Case for ${dateStr} already exists — skipping`);
      return { itemsProcessed: 0, meta: { skipped: true } };
    }

    const category = pickCategory(dateStr);
    const difficulty = pickDifficulty(dateStr);
    const prompt = PROMPTS.dailyCase({ category, difficulty, dateStr });

    const { result, meta } = await run({
      system: prompt.system,
      user: prompt.user,
      json: true,
    });

    await DailyCase.create({
      dateKey: dateStr,
      title: result.title,
      category,
      scenario: result.scenario,
      question: result.question,
      framework: result.framework,
      aiGenerated: true,
      difficulty,
      solution: result.solution,
      learningOutcomes: result.learningOutcomes || [],
    });

    return {
      provider: meta.provider,
      model: meta.model,
      tokensUsed: meta.tokensUsed,
      itemsProcessed: 1,
      meta: { category, difficulty, dateStr },
    };
  });
}

module.exports = { generateDailyCase };
