/**
 * Phase 2 — Vector Store
 * MongoDB-backed vector storage and nearest-neighbour search.
 * Stores embeddings alongside the source document reference.
 * For datasets < 50k docs cosine similarity in JS is fast enough.
 * Upgrade path: replace with MongoDB Atlas Vector Search or Pinecone.
 */

const mongoose = require('mongoose');
const { embed, cosineSimilarity } = require('./embed');

// ── Schema ─────────────────────────────────────────────────────────────────

const vectorEntrySchema = new mongoose.Schema({
  sourceCollection: { type: String, required: true, index: true }, // source collection name
  docId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  text:       { type: String, maxlength: 8000 },
  vector:     { type: [Number], required: true },
  metadata:   { type: Object, default: {} },
  updatedAt:  { type: Date, default: Date.now, index: true },
}, { collection: 'vectorstore' });

vectorEntrySchema.index({ sourceCollection: 1, docId: 1 }, { unique: true });

const VectorEntry = mongoose.models.VectorEntry
  || mongoose.model('VectorEntry', vectorEntrySchema);

// ── Write ──────────────────────────────────────────────────────────────────

/**
 * Upsert an embedding for a document.
 */
async function upsertEmbedding({ collection, docId, text, metadata = {} }) {
  const vector = await embed(text);
  if (!vector) return null;

  return VectorEntry.findOneAndUpdate(
    { sourceCollection: collection, docId },
    { $set: { sourceCollection: collection, text, vector, metadata, updatedAt: new Date() } },
    { upsert: true, new: true }
  );
}

// ── Search ─────────────────────────────────────────────────────────────────

/**
 * Find the top-k most similar documents in a collection.
 * @param {string}   query      - Natural language query
 * @param {string}   collection - Which collection to search
 * @param {number}   [k=5]     - Number of results
 * @param {number}   [threshold=0.3] - Minimum similarity
 */
async function semanticSearch({ query, collection, k = 5, threshold = 0.3 }) {
  const queryVec = await embed(query);
  if (!queryVec) return [];

  // Load candidate vectors from MongoDB
  const candidates = await VectorEntry.find({ sourceCollection: collection })
    .select('docId vector metadata text')
    .lean();

  const scored = candidates
    .map((c) => ({ ...c, score: cosineSimilarity(queryVec, c.vector) }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored.map((c) => ({
    docId: c.docId,
    score: parseFloat(c.score.toFixed(4)),
    metadata: c.metadata,
    snippet: (c.text || '').slice(0, 200),
  }));
}

module.exports = { upsertEmbedding, semanticSearch, VectorEntry };
