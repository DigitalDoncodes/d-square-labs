const promptRegistry = require('./promptRegistry');

const VERSION_HISTORY = {};

function recordVersionUsage(promptId, version, outcome, latencyMs) {
  if (!VERSION_HISTORY[promptId]) {
    VERSION_HISTORY[promptId] = {};
  }
  if (!VERSION_HISTORY[promptId][version]) {
    VERSION_HISTORY[promptId][version] = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalLatencyMs: 0,
      confidenceSum: 0,
      validationFailures: 0,
      lastUsed: null,
    };
  }

  const stats = VERSION_HISTORY[promptId][version];
  stats.totalCalls++;
  stats.totalLatencyMs += latencyMs || 0;
  stats.lastUsed = new Date();

  if (outcome === 'success') {
    stats.successfulCalls++;
  } else if (outcome === 'failed') {
    stats.failedCalls++;
  }

  if (outcome === 'validation_failure') {
    stats.validationFailures++;
  }
}

function recordConfidence(promptId, version, confidence) {
  if (!VERSION_HISTORY[promptId]?.[version]) return;
  VERSION_HISTORY[promptId][version].confidenceSum += confidence || 0;
}

function getVersionStats(promptId, version) {
  if (!VERSION_HISTORY[promptId]) return null;
  const stats = VERSION_HISTORY[promptId][version];
  if (!stats) return null;

  return {
    ...stats,
    avgLatencyMs: stats.totalCalls > 0 ? Math.round(stats.totalLatencyMs / stats.totalCalls) : 0,
    avgConfidence: stats.totalCalls > 0 ? parseFloat((stats.confidenceSum / stats.totalCalls).toFixed(3)) : 0,
    successRate: stats.totalCalls > 0 ? parseFloat((stats.successfulCalls / stats.totalCalls).toFixed(3)) : 0,
    validationFailRate: stats.totalCalls > 0 ? parseFloat((stats.validationFailures / stats.totalCalls).toFixed(3)) : 0,
  };
}

function getAllVersionStats(promptId) {
  const versions = promptRegistry.getAllVersions(promptId);
  return versions.map((v) => ({
    version: v.version,
    ...getVersionStats(promptId, v.version),
  }));
}

function compareVersions(promptId) {
  const allStats = getAllVersionStats(promptId);
  if (!allStats || allStats.length < 2) return null;

  let best = allStats[0];
  for (const stats of allStats) {
    if (!stats) continue;
    const currentScore = (stats.successRate || 0) * 0.5 + (stats.avgConfidence || 0) * 0.3 - (stats.validationFailRate || 0) * 0.2;
    const bestScore = (best.successRate || 0) * 0.5 + (best.avgConfidence || 0) * 0.3 - (best.validationFailRate || 0) * 0.2;
    if (currentScore > bestScore) best = stats;
  }

  return {
    bestVersion: best.version,
    recommendation: best.version !== allStats[0]?.version
      ? `Version ${best.version} outperforms current active version`
      : 'Current version is performing best',
    versions: allStats,
  };
}

async function suggestVersionRollback(promptId) {
  const active = promptRegistry.getActiveVersion(promptId);
  const allStats = getAllVersionStats(promptId);

  if (!allStats || allStats.length < 2) return null;

  const activeStats = allStats.find((s) => s.version === active);
  if (!activeStats) return null;

  if (activeStats.totalCalls < 10) return null;

  if (activeStats.validationFailRate > 0.3 && activeStats.successRate < 0.6) {
    const bestHistorical = allStats
      .filter((s) => s.version !== active && s.totalCalls >= 5)
      .sort((a, b) => (b.successRate || 0) - (a.successRate || 0));

    if (bestHistorical.length > 0 && (bestHistorical[0].successRate || 0) > (activeStats.successRate || 0) + 0.15) {
      return {
        suggestedVersion: bestHistorical[0].version,
        reason: `Current version has ${(activeStats.validationFailRate * 100).toFixed(0)}% validation failure rate vs ${(bestHistorical[0].validationFailRate * 100).toFixed(0)}%`,
        activeStats,
        suggestedStats: bestHistorical[0],
      };
    }
  }

  return null;
}

module.exports = {
  recordVersionUsage,
  recordConfidence,
  getVersionStats,
  getAllVersionStats,
  compareVersions,
  suggestVersionRollback,
};
