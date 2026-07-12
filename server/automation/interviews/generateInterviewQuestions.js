const { run } = require('../../ai/runner');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const Company = require('../../models/Company');

async function generateInterviewQuestions() {
  return runJob('interview-questions-generation', async () => {
    // Companies with few or no interview questions
    const companies = await Company.find({
      $or: [
        { interviewQuestions: { $size: 0 } },
        { interviewQuestions: { $exists: false } },
        { aiQuestionsGeneratedAt: { $exists: false } },
      ],
    }).limit(10);

    if (companies.length === 0) {
      console.log('[interview-questions] All companies have questions');
      return { itemsProcessed: 0 };
    }

    let processed = 0;
    let totalTokens = 0;

    for (const company of companies) {
      try {
        const prompt = PROMPTS.interviewQuestions({
          companyName: company.name,
          sector: company.sector,
          roles: company.roles,
        });

        const { result, meta } = await run({ system: prompt.system, user: prompt.user, json: true });
        totalTokens += meta.tokensUsed || 0;

        // Flatten all question types into the existing schema format
        const questions = [
          ...(result.hr || []).map((q) => ({ category: 'hr', question: q.question })),
          ...(result.technical || []).map((q) => ({ category: 'technical', question: q.question })),
          ...(result.case || []).map((q) => ({ category: 'case', question: q.question })),
          ...(result.behavioral || []).map((q) => ({ category: 'hr', question: q.question })),
        ];

        await Company.findByIdAndUpdate(company._id, {
          $push: { interviewQuestions: { $each: questions } },
          aiQuestionsGeneratedAt: new Date(),
        });

        processed++;
      } catch (err) {
        console.error(`[interview-questions] Failed for ${company.name}: ${err.message}`);
      }
    }

    return { itemsProcessed: processed, tokensUsed: totalTokens };
  });
}

module.exports = { generateInterviewQuestions };
