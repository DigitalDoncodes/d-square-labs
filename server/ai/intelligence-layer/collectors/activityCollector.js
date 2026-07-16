const ChatMessage = require('../../../models/ChatMessage');
const AiUsage = require('../../../models/AiUsage');

async function collect(userId) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);
    const dateKey = todayStart.toISOString().slice(0, 10);

    const [chatCount, aiUsage, recentMessages] = await Promise.all([
      ChatMessage.countDocuments({ user: userId, createdAt: { $gte: todayStart } }).catch(() => 0),
      AiUsage.findOne({ user: userId, dateKey }).lean().catch(() => null),
      ChatMessage.find({ user: userId, role: 'user' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('content createdAt')
        .lean()
        .catch(() => []),
    ]);

    const aiCallsToday = aiUsage?.count || 0;

    const queryTopics = [];
    for (const msg of recentMessages) {
      const words = (msg.content || '').split(/\s+/).filter((w) => w.length > 3);
      queryTopics.push(...words.slice(0, 5));
    }
    const uniqueTopics = [...new Set(queryTopics)].slice(0, 8);

    return {
      chatMessagesToday: chatCount,
      aiCallsToday,
      recentQueries: recentMessages.slice(0, 5).map((m) => ({
        text: (m.content || '').slice(0, 100),
        at: m.createdAt,
      })),
      recentQueryTopics: uniqueTopics,
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
