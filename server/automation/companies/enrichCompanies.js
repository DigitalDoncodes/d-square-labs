const { run } = require('../../ai/runner');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const Company = require('../../models/Company');
const cfg = require('../../config/automation');

async function enrichCompanies() {
  return runJob('company-enrichment', async () => {
    // Only enrich companies that haven't been enriched in the last 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const companies = await Company.find({
      $or: [
        { aiEnrichedAt: { $lt: cutoff } },
        { aiEnrichedAt: { $exists: false } },
      ],
    }).limit(5); // Process 5 per run to stay within rate limits

    if (companies.length === 0) {
      console.log('[company-enrichment] All companies up to date');
      return { itemsProcessed: 0 };
    }

    let processed = 0;
    let failed = 0;
    let totalTokens = 0;

    for (const company of companies) {
      try {
        const prompt = PROMPTS.companyEnrich({
          name: company.name,
          sector: company.sector,
          existingOverview: company.overview,
        });

        const { result, meta } = await run({ system: prompt.system, user: prompt.user, json: true });
        totalTokens += meta.tokensUsed || 0;

        // Only update if AI confidence is above threshold
        if ((result.confidence || 0.5) >= cfg.confidence.minimum) {
          const updates = {
            aiEnrichedAt: new Date(),
            aiEnrichedBy: meta.provider,
          };

          // Carefully merge — don't overwrite if admin has set these fields already
          if (!company.overview || company.overview.length < 100) updates.overview = result.overview;
          if (!company.businessModel) updates.businessModel = result.businessModel;
          if (!company.whatTheyLookFor) updates.whatTheyLookFor = result.whatTheyLookFor;
          if (!company.salaryRange) updates.salaryRange = result.salaryRange;
          if (!company.roles?.length && result.roles?.length) updates.roles = result.roles;
          if (!company.rounds?.length && result.rounds?.length) updates.rounds = result.rounds;
          if (!company.prepTips?.length && result.prepTips?.length) updates.prepTips = result.prepTips;

          await Company.findByIdAndUpdate(company._id, updates);
          processed++;
        }
      } catch (err) {
        console.error(`[company-enrichment] Failed for ${company.name}: ${err.message}`);
        failed++;
      }
    }

    return {
      itemsProcessed: processed,
      itemsFailed: failed,
      tokensUsed: totalTokens,
    };
  });
}

module.exports = { enrichCompanies };
