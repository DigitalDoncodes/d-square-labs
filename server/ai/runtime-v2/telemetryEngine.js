const AutomationLog = require('../../models/AutomationLog');
const AiUsage = require('../../models/AiUsage');

const SESSION_LOGS = [];
const MAX_SESSION_LOGS = 1000;

let _telemetryEnabled = true;

function disable() { _telemetryEnabled = false; }
function enable() { _telemetryEnabled = true; }

function recordCall({ userId, task, intent, provider, model, tokensUsed, promptTokens, completionTokens, latencyMs, estimatedCostUsd, confidence, status, validationIssues, sourceCount, promptId, promptVersion, retryAttempts, contextSize, strategy }) {
  if (!_telemetryEnabled) return;

  const entry = {
    userId,
    task: task || null,
    intent: intent || null,
    provider,
    model,
    tokensUsed: tokensUsed || 0,
    promptTokens: promptTokens || 0,
    completionTokens: completionTokens || 0,
    latencyMs: latencyMs || 0,
    estimatedCostUsd: estimatedCostUsd || 0,
    confidence: confidence || 0,
    status: status || 'unknown',
    validationIssues: validationIssues || [],
    sourceCount: sourceCount || 0,
    promptId: promptId || null,
    promptVersion: promptVersion || null,
    retryAttempts: retryAttempts || 0,
    contextSize: contextSize || 0,
    strategy: strategy || null,
    timestamp: new Date().toISOString(),
  };

  SESSION_LOGS.push(entry);
  if (SESSION_LOGS.length > MAX_SESSION_LOGS) SESSION_LOGS.shift();
}

async function persistCall({ job, userId, task, intent, provider, model, tokensUsed, estimatedCostUsd, confidence, validationStatus, ragSourceCount, durationMs, status, error, itemsProcessed, meta }) {
  if (!_telemetryEnabled) return;

  try {
    await AutomationLog.create({
      job: job || task || 'ai-call',
      status: status || 'success',
      startedAt: new Date(Date.now() - (durationMs || 0)),
      finishedAt: new Date(),
      durationMs: durationMs || 0,
      provider,
      model,
      tokensUsed: tokensUsed || 0,
      itemsProcessed: itemsProcessed || 0,
      estimatedCostUsd: estimatedCostUsd || 0,
      confidence: confidence || null,
      validationStatus: validationStatus || null,
      ragSourceCount: ragSourceCount || 0,
      error: error || null,
      meta: {
        ...(meta || {}),
        userId,
        intent,
        task,
      },
    });
  } catch (err) {
    console.warn('[telemetry] Failed to persist AutomationLog:', err.message);
  }
}

async function incrementUserUsage(userId) {
  if (!_telemetryEnabled) return;
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    await AiUsage.findOneAndUpdate(
      { user: userId, dateKey },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
  } catch (err) {
    if (err.code !== 11000) console.warn('[telemetry] Failed to increment AiUsage:', err.message);
  }
}

function getSessionSummary() {
  const summary = {
    totalCalls: SESSION_LOGS.length,
    byProvider: {},
    byIntent: {},
    byStatus: {},
    totalCost: 0,
    totalTokens: 0,
    avgLatencyMs: 0,
  };

  if (SESSION_LOGS.length === 0) return summary;

  for (const entry of SESSION_LOGS) {
    summary.byProvider[entry.provider] = (summary.byProvider[entry.provider] || 0) + 1;
    summary.byIntent[entry.intent || 'unknown'] = (summary.byIntent[entry.intent || 'unknown'] || 0) + 1;
    summary.byStatus[entry.status] = (summary.byStatus[entry.status] || 0) + 1;
    summary.totalCost += entry.estimatedCostUsd || 0;
    summary.totalTokens += entry.tokensUsed || 0;
    summary.avgLatencyMs += entry.latencyMs || 0;
  }

  summary.avgLatencyMs = Math.round(summary.avgLatencyMs / SESSION_LOGS.length);
  summary.totalCost = parseFloat(summary.totalCost.toFixed(6));

  return summary;
}

function getRecentCalls(count = 20) {
  return SESSION_LOGS.slice(-count);
}

function getCallsByIntent(intent) {
  return SESSION_LOGS.filter((e) => e.intent === intent);
}

function getCallsByProvider(provider) {
  return SESSION_LOGS.filter((e) => e.provider === provider);
}

module.exports = {
  recordCall,
  persistCall,
  incrementUserUsage,
  getSessionSummary,
  getRecentCalls,
  getCallsByIntent,
  getCallsByProvider,
  disable,
  enable,
};
