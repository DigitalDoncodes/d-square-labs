const cfg = require('../../config/automation');

const METRICS_WINDOW_SIZE = 100;
const DECAY_FACTOR = 0.95;

const metrics = new Map();
const windows = new Map();

function _getWindow(providerName) {
  if (!windows.has(providerName)) {
    windows.set(providerName, []);
  }
  return windows.get(providerName);
}

function _getOrCreateMetrics(providerName) {
  if (!metrics.has(providerName)) {
    metrics.set(providerName, {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalLatencyMs: 0,
      maxLatencyMs: 0,
      minLatencyMs: Infinity,
      totalCost: 0,
      rateLimitHits: 0,
      timeoutCount: 0,
      consecutiveFailures: 0,
      lastFailureAt: null,
      lastSuccessAt: null,
      healthScore: 100,
      availability: 1.0,
      avgLatencyMs: 0,
      successRate: 1.0,
      lastUpdated: new Date(),
    });
  }
  return metrics.get(providerName);
}

function recordSuccess({ provider, latencyMs, costUsd }) {
  const m = _getOrCreateMetrics(provider);
  const window = _getWindow(provider);

  window.push({ success: true, latencyMs, costUsd, timestamp: Date.now() });
  if (window.length > METRICS_WINDOW_SIZE) window.shift();

  m.totalCalls++;
  m.successfulCalls++;
  m.totalLatencyMs += latencyMs;
  m.maxLatencyMs = Math.max(m.maxLatencyMs, latencyMs);
  m.minLatencyMs = Math.min(m.minLatencyMs, latencyMs);
  m.totalCost += costUsd || 0;
  m.consecutiveFailures = 0;
  m.lastSuccessAt = new Date();
  m.lastUpdated = new Date();

  _recompute(provider, m, window);
}

function recordFailure({ provider, errorType, latencyMs }) {
  const m = _getOrCreateMetrics(provider);
  const window = _getWindow(provider);

  window.push({ success: false, errorType, latencyMs: latencyMs || 0, timestamp: Date.now() });
  if (window.length > METRICS_WINDOW_SIZE) window.shift();

  m.totalCalls++;
  m.failedCalls++;
  m.consecutiveFailures++;
  m.lastFailureAt = new Date();
  m.lastUpdated = new Date();

  if (errorType === 'rate_limit' || errorType === '429') {
    m.rateLimitHits++;
  }
  if (errorType === 'timeout') {
    m.timeoutCount++;
  }

  _recompute(provider, m, window);
}

function _recompute(provider, m, window) {
  if (window.length === 0) return;
  const recent = window.slice(-20);
  const successes = recent.filter((r) => r.success).length;
  m.successRate = recent.length > 0 ? successes / recent.length : 0;
  m.avgLatencyMs = recent.reduce((s, r) => s + r.latencyMs, 0) / recent.length;

  let health = 100;
  health -= (1 - m.successRate) * 40;
  health -= Math.min(m.consecutiveFailures * 8, 40);
  if (m.rateLimitHits > 5) health -= 15;
  if (m.timeoutCount > 3) health -= 10;
  health = Math.max(10, Math.min(100, health));

  const windowAvailability = successes / Math.max(recent.length, 1);
  m.healthScore = Math.round(health);
  m.availability = Math.round(windowAvailability * 1000) / 1000;
}

function getHealth(providerName) {
  const m = metrics.get(providerName);
  if (!m) {
    return {
      healthScore: 100,
      availability: 1.0,
      successRate: 1.0,
      avgLatencyMs: 0,
      consecutiveFailures: 0,
      rateLimitHits: 0,
      timeoutCount: 0,
      totalCalls: 0,
    };
  }
  return {
    healthScore: m.healthScore,
    availability: m.availability,
    successRate: m.successRate,
    avgLatencyMs: m.avgLatencyMs,
    maxLatencyMs: m.maxLatencyMs,
    consecutiveFailures: m.consecutiveFailures,
    rateLimitHits: m.rateLimitHits,
    timeoutCount: m.timeoutCount,
    totalCalls: m.totalCalls,
    lastUpdated: m.lastUpdated,
  };
}

function getAllHealth() {
  const result = {};
  for (const providerName of Object.keys(cfg.providers)) {
    if (providerName === 'primary' || providerName === 'fallback') continue;
    result[providerName] = getHealth(providerName);
  }
  return result;
}

function getProviderPriority(providerName) {
  const health = getHealth(providerName);
  if (health.healthScore < 30 || health.availability < 0.5) return -1;
  if (health.healthScore < 50 || health.availability < 0.7) return 0;
  if (health.healthScore < 70 || health.consecutiveFailures > 3) return 1;
  return 2;
}

function isProviderHealthy(providerName) {
  const health = getHealth(providerName);
  return health.healthScore >= 30 && health.availability >= 0.5;
}

module.exports = {
  recordSuccess,
  recordFailure,
  getHealth,
  getAllHealth,
  getProviderPriority,
  isProviderHealthy,
};
