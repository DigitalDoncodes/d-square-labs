/**
 * Phase 2 — Embeddings
 * Generates vector embeddings for semantic search.
 * Uses OpenAI's text-embedding-3-small when available; falls back to
 * a lightweight TF-IDF bag-of-words vector for zero-dependency operation.
 */

let _openai = null;

function _getOpenAI() {
  if (_openai) return _openai;
  const { OpenAI } = require('openai');
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM   = 1536;

/**
 * Generate an embedding vector for the given text.
 * Returns a Float32Array-like number[].
 */
async function embed(text) {
  const clean = (text || '').replace(/\s+/g, ' ').trim().slice(0, 8000);
  if (!clean) return null;

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await _getOpenAI().embeddings.create({
        model: EMBEDDING_MODEL,
        input: clean,
      });
      return res.data[0].embedding;
    } catch (err) {
      console.warn('[embed] OpenAI embedding failed, falling back to TF-IDF:', err.message);
    }
  }

  // Fallback: deterministic TF-IDF-inspired sparse vector (1536 dims)
  return _tfidfVector(clean, EMBEDDING_DIM);
}

/**
 * Cosine similarity between two vectors.
 * @returns {number} 0..1
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Fallback: sparse hash-based vector ─────────────────────────────────────

function _tfidfVector(text, dims) {
  const vec = new Array(dims).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;

  for (const [token, count] of Object.entries(freq)) {
    const idx = _hashStr(token) % dims;
    vec[idx] += count / tokens.length;
  }

  // Normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

function _hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

module.exports = { embed, cosineSimilarity, EMBEDDING_DIM };
