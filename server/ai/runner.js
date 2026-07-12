/**
 * AI Runner — wraps provider calls with:
 *   • Retry with exponential backoff
 *   • Provider fallback
 *   • Automatic JSON parsing
 *   • Execution metadata + cost estimation
 */
const { getProvider } = require('./providers');
const { parseJSON } = require('./parser');
const cfg = require('../config/automation');
const { estimateCost } = require('./router');

/**
 * Run an AI completion with retry + fallback.
 *
 * @param {object} opts
 * @param {string} opts.system   - System prompt
 * @param {string} opts.user     - User prompt
 * @param {string} [opts.provider] - Preferred provider name
 * @param {boolean} [opts.json]  - Parse response as JSON (default true)
 * @param {number} [opts.maxTokens]
 * @returns {Promise<{ result, meta }>}
 */
async function run({ system, user, provider: preferredProvider, json = true, maxTokens }) {
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

module.exports = { run };
