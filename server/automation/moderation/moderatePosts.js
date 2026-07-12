const { run } = require('../../ai/runner');
const PROMPTS = require('../../ai/prompts');
const { runJob } = require('../jobRunner');
const Post = require('../../models/Post');
const cfg = require('../../config/automation');

async function moderatePosts() {
  return runJob('discussion-moderation', async () => {
    // Posts not yet moderated (no aiModeratedAt field)
    const posts = await Post.find({ aiModeratedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(cfg.content.moderationBatchSize);

    if (posts.length === 0) return { itemsProcessed: 0 };

    let processed = 0;
    let hidden = 0;
    let flagged = 0;
    let totalTokens = 0;

    for (const post of posts) {
      try {
        const prompt = PROMPTS.moderatePost({ title: post.title, body: post.body });
        const { result, meta } = await run({ system: prompt.system, user: prompt.user, json: true });
        totalTokens += meta.tokensUsed || 0;

        const update = {
          aiModeratedAt: new Date(),
          aiModerationScores: {
            spam: result.spam || 0,
            hate: result.hate || 0,
            advertising: result.advertising || 0,
            lowQuality: result.lowQuality || 0,
          },
          aiModerationResult: result.overall,
        };

        if (result.overall === 'hide') {
          update.hidden = true;
          update.hiddenReason = result.reason;
          hidden++;
        } else if (result.overall === 'review') {
          update.flaggedForReview = true;
          flagged++;
        }

        // Apply suggested tag if post has no custom tag
        if (result.suggestedTag && post.tag === 'general') {
          update.tag = result.suggestedTag;
        }

        await Post.findByIdAndUpdate(post._id, update);
        processed++;
      } catch (err) {
        console.error(`[moderation] Failed for post ${post._id}: ${err.message}`);
      }
    }

    return {
      itemsProcessed: processed,
      tokensUsed: totalTokens,
      meta: { hidden, flagged },
    };
  });
}

module.exports = { moderatePosts };
