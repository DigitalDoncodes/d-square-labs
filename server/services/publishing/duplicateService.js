const ContentItem = require('../../models/ContentItem');
const { cosineSimilarity } = require('../../ai/embeddings/embed');

const SIMILARITY_THRESHOLD = 0.92;

// Exact duplicate: same sha256 among non-rejected items.
async function findExact(hash, excludeId) {
  if (!hash) return null;
  return ContentItem.findOne({
    'file.hash': hash,
    status: { $ne: 'rejected' },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select('meta.title analysis.title file.originalName status destination');
}

// Near duplicate: cosine similarity over stored embeddings of recent items.
async function findSimilar(item, vector) {
  const candidates = await ContentItem.find({
    _id: { $ne: item._id },
    status: { $in: ['ready_for_review', 'draft', 'scheduled', 'published'] },
    embedding: { $exists: true, $ne: [] },
  })
    .select('+embedding meta.title analysis.title file.originalName status destination')
    .sort({ createdAt: -1 })
    .limit(200);

  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    const score = cosineSimilarity(vector, c.embedding);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return bestScore >= SIMILARITY_THRESHOLD ? best : null;
}

module.exports = { findExact, findSimilar, SIMILARITY_THRESHOLD };
