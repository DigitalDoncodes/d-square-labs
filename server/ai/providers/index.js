const cfg = require('../../config/automation');
const NvidiaProvider = require('./nvidiaProvider');
const OpenAICompatibleProvider = require('./openaiCompatible');
const AnthropicProvider = require('./anthropicProvider');

const providers = {};

function buildProvider(name) {
  if (providers[name]) return providers[name];
  const c = cfg.providers[name];
  if (!c) throw new Error(`Unknown AI provider: ${name}`);

  if (name === 'nvidia') {
    providers[name] = new NvidiaProvider({ ...c, name });
  } else if (name === 'anthropic') {
    providers[name] = new AnthropicProvider({ ...c, name });
  } else {
    providers[name] = new OpenAICompatibleProvider({ ...c, name });
  }
  return providers[name];
}

function _candidateOrder(preferredName) {
  return [
    preferredName,
    'nvidia',
    'ollama',
    cfg.providers.primary,
    cfg.providers.fallback,
    'groq', 'openai', 'gemini', 'openrouter',
  ].filter(Boolean);
}

/**
 * Returns the best available provider.
 * Fallback chain: NVIDIA → Ollama → Error
 *
 * "Available" here means isAvailable() — a static check (does this provider
 * have a key configured), not a live reachability probe. Ollama's key is a
 * hardcoded placeholder (see config/automation.js), so it reports available
 * even when no local Ollama daemon is running. Callers that only try the
 * single provider getProvider() returns have no protection against that —
 * use getProviderChain() below when the call site can retry across
 * candidates on a real failure.
 */
function getProvider(preferredName) {
  for (const name of _candidateOrder(preferredName)) {
    try {
      const p = buildProvider(name);
      if (p.isAvailable()) return p;
    } catch (_) { /* skip unknown */ }
  }
  throw new Error(
    'No AI provider available. Set NVIDIA_API_KEY or ensure Ollama is running locally.'
  );
}

/**
 * Same ordering as getProvider(), but returns every statically-available
 * candidate (not just the first) so a caller can fall through to the next
 * one if a real call fails — protects against the isAvailable()-passes-but-
 * unreachable case described above (e.g. Ollama configured but not running).
 */
function getProviderChain(preferredName) {
  const chain = [];
  for (const name of _candidateOrder(preferredName)) {
    try {
      const p = buildProvider(name);
      if (p.isAvailable() && !chain.includes(p)) chain.push(p);
    } catch (_) { /* skip unknown */ }
  }
  return chain;
}

function clearCache() {
  Object.keys(providers).forEach((key) => delete providers[key]);
}

module.exports = { getProvider, getProviderChain, buildProvider, clearCache };
