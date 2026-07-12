const { run } = require('../../ai/runner');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const NewsletterDraft = require('../../models/NewsletterDraft');
const Post = require('../../models/Post');
const Company = require('../../models/Company');
const DailyBriefing = require('../../models/DailyBriefing');
const User = require('../../models/User');
const { sendAnnouncementEmail } = require('../../config/mailer');

function getMondayKey() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().slice(0, 10);
}

async function generateWeeklyNewsletter() {
  return runJob('weekly-newsletter-generation', async () => {
    const weekStart = getMondayKey();

    const existing = await NewsletterDraft.findOne({ weekStart });
    if (existing?.status === 'sent') {
      console.log(`[newsletter] Already sent for week ${weekStart}`);
      return { itemsProcessed: 0, meta: { skipped: true } };
    }

    // Gather data from the past 7 days
    const since = new Date(weekStart);

    const [topPosts, topCompanies, recentBriefings] = await Promise.all([
      Post.find({ createdAt: { $gte: since }, hidden: { $ne: true } })
        .sort({ 'likes.length': -1 }).limit(3).select('title tag').lean(),
      Company.find().sort({ views: -1 }).limit(3).select('name sector').lean(),
      DailyBriefing.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 }).limit(3).select('headline sections.economy sections.placements').lean(),
    ]);

    const topDiscussions = topPosts.map((p) => `• [${p.tag}] ${p.title}`).join('\n') || 'No discussions this week';
    const topCompaniesTxt = topCompanies.map((c) => `• ${c.name} (${c.sector})`).join('\n') || 'No data';
    const briefingSummary = recentBriefings.map((b) => b.headline).join('\n') || 'No briefings generated';

    const prompt = PROMPTS.weeklyNewsletter({ weekStart, topDiscussions, topCompanies: topCompaniesTxt, briefingSummary });
    const { result, meta } = await run({ system: prompt.system, user: prompt.user, json: true });

    const draft = await NewsletterDraft.findOneAndUpdate(
      { weekStart },
      {
        weekStart,
        subject: result.subject,
        preheader: result.preheader,
        headline: result.headline,
        intro: result.intro,
        sections: result.sections,
        closingNote: result.closingNote,
        generatedBy: meta.provider,
        model: meta.model,
        tokensUsed: meta.tokensUsed,
        status: 'draft',
      },
      { upsert: true, new: true }
    );

    // Auto-send to all approved members
    const recipients = await User.find({ status: 'approved', role: { $ne: 'admin' } })
      .select('name email').lean();

    if (recipients.length > 0) {
      try {
        const announcement = {
          title: result.subject,
          body: `${result.intro}\n\n${Object.values(result.sections || {}).join('\n\n')}\n\n${result.closingNote || ''}`,
        };
        await sendAnnouncementEmail(recipients, announcement);
        await NewsletterDraft.findByIdAndUpdate(draft._id, {
          status: 'sent',
          sentAt: new Date(),
          recipientCount: recipients.length,
        });
      } catch (emailErr) {
        console.error(`[newsletter] Email send failed: ${emailErr.message}`);
        await NewsletterDraft.findByIdAndUpdate(draft._id, { status: 'failed' });
      }
    }

    return { provider: meta.provider, model: meta.model, tokensUsed: meta.tokensUsed, itemsProcessed: 1 };
  });
}

module.exports = { generateWeeklyNewsletter };
