const crypto = require('crypto');

const CACHE_TTL = {
  'company-enrichment': 24 * 60 * 60 * 1000,
  'summarise-note': 60 * 60 * 1000,
  'news-summary': 30 * 60 * 1000,
  'compare-companies': 24 * 60 * 60 * 1000,
  'fact-verify': 60 * 60 * 1000,
  'knowledge-graph': 12 * 60 * 60 * 1000,
  default: 15 * 60 * 1000,
};

const CONTENT_TYPE_TTL = {
  'company-profile': 24 * 60 * 60 * 1000,
  'news-summary': 30 * 60 * 1000,
  'note-summary': 60 * 60 * 1000,
  'comparison': 12 * 60 * 60 * 1000,
  'verification': 60 * 60 * 1000,
  default: 15 * 60 * 1000,
};

const store = new Map();
const MAX_STORE_SIZE = 500;

function _makeKey(taskName, userId, contextHash) {
  const raw = `${taskName || ''}:${userId || ''}:${contextHash || ''}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

function set(taskName, userId, data, taskOptions = {}) {
  const ttl = CACHE_TTL[taskName] || CACHE_TTL.default;
  const key = _makeKey(taskName, userId, taskOptions.contextHash);
  const contentType = taskOptions.contentType;

  const effectiveTtl = contentType
    ? (CONTENT_TYPE_TTL[contentType] || CONTENT_TYPE_TTL.default)
    : ttl;

  if (store.size >= MAX_STORE_SIZE) {
    const oldest = [...store.entries()].sort(([, a], [, b]) => a.cachedAt - b.cachedAt)[0];
    if (oldest) store.delete(oldest[0]);
  }

  store.set(key, {
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + effectiveTtl,
    taskName,
    userId,
    contentType,
  });
}

function get(taskName, userId, contextHash) {
  const key = _makeKey(taskName, userId, contextHash);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function hasCache(taskName, userId, contextHash) {
  const key = _makeKey(taskName, userId, contextHash);
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  return true;
}

function invalidate(taskName, userId) {
  const pattern = _makeKey(taskName, userId, '').slice(0, 16);
  for (const [key] of store) {
    if (key.startsWith(pattern)) store.delete(key);
  }
}

function invalidateAll() {
  store.clear();
}

function getStats() {
  return {
    size: store.size,
    maxSize: MAX_STORE_SIZE,
    keys: [...store.keys()],
    utilization: parseFloat(((store.size / MAX_STORE_SIZE) * 100).toFixed(1)) + '%',
  };
}

module.exports = {
  set,
  get,
  hasCache,
  invalidate,
  invalidateAll,
  getStats,
  CACHE_TTL,
  CONTENT_TYPE_TTL,
};
