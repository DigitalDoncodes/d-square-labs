const cfg = require('../../config/automation');
const OpenAICompatibleProvider = require('./openaiCompatible');
const AnthropicProvider = require('./anthropicProvider');

const providers = {};

function buildProvider(name) {
  if (providers[name]) return providers[name];
  const c = cfg.providers[name];
  if (!c) throw new Error(`Unknown AI provider: ${name}`);

  if (name === 'anthropic') {
    providers[name] = new AnthropicProvider({ ...c, name });
  } else {
    providers[name] = new OpenAICompatibleProvider({ ...c, name });
  }
  return providers[name];
}

/**
 * Returns the best available provider:
 * tries primary → fallback → any available.
 */
function getProvider(preferredName) {
  const order = [
    preferredName,
    cfg.providers.primary,
    cfg.providers.fallback,
    'groq', 'anthropic', 'openai', 'gemini', 'openrouter', 'ollama',
  ].filter(Boolean);

  for (const name of order) {
    try {
      const p = buildProvider(name);
      if (p.isAvailable()) return p;
    } catch (_) { /* skip unknown */ }
  }
  throw new Error('No AI provider is configured. Set GROQ_API_KEY or OPENAI_API_KEY.');
}

module.exports = { getProvider, buildProvider };
