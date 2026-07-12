/**
 * Shared wrapper for all automation jobs.
 * Handles: AutomationLog create/update, timing, error capture, console output.
 */
const AutomationLog = require('../models/AutomationLog');

async function runJob(jobName, fn) {
  const log = await AutomationLog.create({ job: jobName, status: 'running', startedAt: new Date() });
  const start = Date.now();
  console.log(`[${jobName}] started at ${new Date().toISOString()}`);
  try {
    const result = await fn(log);
    const durationMs = Date.now() - start;
    // Pull cost/confidence from pipeline result if present
    const { estimatedCostUsd, confidence, validationStatus, ragSourceCount, ...rest } = result || {};
    await AutomationLog.findByIdAndUpdate(log._id, {
      status: 'success',
      finishedAt: new Date(),
      durationMs,
      ...(estimatedCostUsd != null ? { estimatedCostUsd } : {}),
      ...(confidence != null ? { confidence } : {}),
      ...(validationStatus ? { validationStatus } : {}),
      ...(ragSourceCount != null ? { ragSourceCount } : {}),
      ...rest,
    });
    console.log(`[${jobName}] completed in ${durationMs}ms${estimatedCostUsd != null ? ` (~$${estimatedCostUsd.toFixed(5)})` : ''}`);
    return result;
  } catch (err) {
    const durationMs = Date.now() - start;
    await AutomationLog.findByIdAndUpdate(log._id, {
      status: 'failed',
      finishedAt: new Date(),
      durationMs,
      error: err.message,
    });
    console.error(`[${jobName}] FAILED in ${durationMs}ms: ${err.message}`);
    throw err;
  }
}

module.exports = { runJob };
