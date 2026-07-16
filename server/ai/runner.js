/**
 * AI Runner — wraps provider calls with:
 *   • Retry with exponential backoff
 *   • Provider fallback
 *   • Automatic JSON parsing
 *   • Execution metadata + cost estimation
 *
 * When aiGateway is configured, all calls route through the gateway
 * so it can decide V1 vs V2 based on the active mode.
 */
const { getProvider } = require('./providers');
const { parseJSON } = require('./parser');
const cfg = require('../config/automation');
const { estimateCost } = require('./router');

/**
 * Native V1 implementation — called directly when gateway is bypassed
 * or when gateway isn't configured.
 */
async function _nativeRun({ system, user, provider: preferredProvider, json = true, maxTokens }) {
  const { maxAttempts, delayMs, backoffMultiplier } = cfg.retry;
  let lastError;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    const delay = attempt > 1 ? delayMs * Math.pow(backoffMultiplier, attempt - 2) : 0;
    if (delay) await new Promise((r) => setTimeout(r, delay));

    try {
      const p = getProvider(preferredProvider);
      const messages = [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user },
      ];

      const raw = await p.complete({ messages, system, maxTokens });
      const result = json ? parseJSON(raw.text, `attempt ${attempt}`) : raw.text;

      const costUsd = estimateCost(raw.provider, raw.promptTokens, raw.completionTokens);
      return {
        result,
        meta: {
          provider: raw.provider,
          model: raw.model,
          tokensUsed: raw.tokensUsed,
          promptTokens: raw.promptTokens,
          completionTokens: raw.completionTokens,
          latencyMs: raw.latencyMs,
          estimatedCostUsd: parseFloat(costUsd.toFixed(6)),
          attempts: attempt,
        },
      };
    } catch (err) {
      lastError = err;
      console.warn(`[AI Runner] attempt ${attempt}/${maxAttempts} failed: ${err.message}`);
    }
  }

  throw new Error(`AI generation failed after ${maxAttempts} attempts: ${lastError?.message}`);
}

/**
 * Public run function — routes through aiGateway when available,
 * otherwise falls back to native V1 execution.
 *
 * @param {object} opts
 * @param {string}  opts.system   - System prompt
 * @param {string}  opts.user     - User prompt
 * @param {string}  [opts.provider] - Preferred provider name
 * @param {boolean} [opts.json]  - Parse response as JSON (default true)
 * @param {number}  [opts.maxTokens]
 * @param {boolean} [opts._gatewayBypass] - Internal flag to skip gateway delegation
 * @returns {Promise<{ result, meta }>}
 */
async function run(opts) {
  // Bypass gateway when called from within the gateway itself (prevents recursion)
  if (opts._gatewayBypass) {
    return _nativeRun(opts);
  }

  try {
    // Lazy require — breaks circular dep: aiGateway requires runner,
    // runner lazily requires aiGateway only at call time (not module load).
    const gateway = require('./aiGateway');
    const gwResult = await gateway.process(opts);

    return {
      result: gwResult.result,
      meta: {
        provider: gwResult.provider,
        model: gwResult.model,
        tokensUsed: gwResult.tokensUsed || 0,
        promptTokens: gwResult._execMeta?.promptTokens || 0,
        completionTokens: gwResult._execMeta?.completionTokens || 0,
        latencyMs: gwResult.latencyMs || 0,
        estimatedCostUsd: gwResult.estimatedCostUsd || 0,
        attempts: gwResult._execMeta?.attempts || 1,
        runtime: gwResult.runtime,
      },
    };
  } catch {
    return _nativeRun(opts);
  }
}

module.exports = { run };
