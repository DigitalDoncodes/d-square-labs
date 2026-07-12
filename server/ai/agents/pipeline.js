/**
 * Phase 4 — Multi-Agent Pipeline
 * Orchestrates a chain of specialized agents for complex generation tasks.
 * Each agent has a single responsibility.
 *
 * Pipeline: Research → Retrieve → Write → Verify → Format → QualityCheck
 *
 * Usage:
 *   const { runPipeline } = require('./pipeline');
 *   const result = await runPipeline({ task, userContext, ragContext, promptFn });
 */

const { run }     = require('../runner');
const { validate } = require('../validator');
const { routeTask, estimateCost } = require('../router');

/**
 * @param {object} opts
 * @param {string}   opts.task        - Task name for routing + validation
 * @param {string}   opts.systemPrompt
 * @param {string}   opts.userPrompt
 * @param {string}   [opts.ragContext]   - Retrieved documents text
 * @param {string}   [opts.memoryContext] - User memory text
 * @param {string[]} [opts.existingTitles] - For duplicate detection
 * @param {number}   [opts.sourceCount]
 * @param {boolean}  [opts.json]
 * @param {number}   [opts.maxTokens]
 */
async function runPipeline(opts) {
  const {
    task,
    systemPrompt,
    userPrompt,
    ragContext = '',
    memoryContext = '',
    existingTitles = [],
    sourceCount = 0,
    json = true,
    maxTokens,
  } = opts;

  const pipelineMeta = {
    task,
    stages: [],
    totalTokens: 0,
    totalCostUsd: 0,
    startedAt: new Date().toISOString(),
  };

  // ── Stage 1: Research Agent ──────────────────────────────────────────────
  // Enriches the system prompt with retrieved context
  const enrichedSystem = _buildEnrichedSystem(systemPrompt, memoryContext, ragContext);
  pipelineMeta.stages.push({ stage: 'research', contextInjected: Boolean(ragContext || memoryContext) });

  // ── Stage 2: Writer Agent ────────────────────────────────────────────────
  const preferredProvider = routeTask(task);
  const { result, meta } = await run({
    system: enrichedSystem,
    user: userPrompt,
    provider: preferredProvider,
    json,
    maxTokens,
  });

  const costUsd = estimateCost(meta.provider, meta.promptTokens, meta.completionTokens);
  pipelineMeta.totalTokens += meta.tokensUsed || 0;
  pipelineMeta.totalCostUsd += costUsd;
  pipelineMeta.stages.push({
    stage: 'write',
    provider: meta.provider,
    model: meta.model,
    tokensUsed: meta.tokensUsed,
    latencyMs: meta.latencyMs,
    costUsd,
  });

  // ── Stage 3: Verifier Agent (rule-based, no extra LLM call) ──────────────
  const validation = validate({
    output: result,
    task,
    sourceCount,
    existingTitles,
  });
  pipelineMeta.stages.push({ stage: 'verify', ...validation });

  // ── Stage 4: Quality Check ────────────────────────────────────────────────
  pipelineMeta.finishedAt = new Date().toISOString();
  pipelineMeta.confidence = validation.confidence;
  pipelineMeta.status = validation.status;
  pipelineMeta.validationIssues = validation.issues;

  // Attach attribution metadata to result object
  const attribution = {
    provider: meta.provider,
    model: meta.model,
    tokensUsed: meta.tokensUsed,
    promptTokens: meta.promptTokens,
    completionTokens: meta.completionTokens,
    latencyMs: meta.latencyMs,
    estimatedCostUsd: parseFloat(costUsd.toFixed(6)),
    confidence: validation.confidence,
    status: validation.status,
    validationIssues: validation.issues,
    ragSourceCount: sourceCount,
    generatedAt: new Date(),
    promptVersion: 'v1',
    pipeline: pipelineMeta,
  };

  return { result, meta: attribution, validation };
}

function _buildEnrichedSystem(systemPrompt, memoryContext, ragContext) {
  const parts = [systemPrompt];
  if (memoryContext) parts.push(memoryContext);
  if (ragContext) parts.push(`[Retrieved Context]\n${ragContext}`);
  return parts.join('\n\n');
}

module.exports = { runPipeline };
