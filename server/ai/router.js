/**
 * Phase 7 — Intelligent Model Routing
 * Routes each task to the cheapest model that can handle it well.
 * Three tiers: fast (cheap), balanced (moderate), powerful (heavy reasoning).
 */

const cfg = require('../config/automation');

// Approximate cost per 1M tokens in USD (input / output)
const PROVIDER_COSTS = {
  groq:        { input: 0.59,  output: 0.79  },
  openai:      { input: 0.15,  output: 0.60  },    // gpt-4o-mini
  anthropic:   { input: 0.25,  output: 1.25  },    // claude-haiku
  gemini:      { input: 0.075, output: 0.30  },    // gemini-flash
  openrouter:  { input: 0.59,  output: 0.79  },
  ollama:      { input: 0,     output: 0     },    // local
  nvidia:      { input: 0.59,  output: 0.79  },
};

// Task → tier mapping. Add new tasks here as the product grows.
const TASK_TIER = {
  // Fast tier — simple summarization, short outputs
  'summarise-note':       'fast',
  'news-summary':         'fast',
  'moderation':           'fast',
  'resume-tip':           'fast',
  'daily-reflection':     'fast',

  // Balanced tier — structured JSON, business explanations
  'daily-briefing':       'balanced',
  'daily-case':           'balanced',
  'company-enrichment':   'balanced',
  'interview-questions':  'balanced',
  'planner-suggest':      'balanced',
  'chat':                 'balanced',

  // Powerful tier — complex reasoning, multi-step analysis
  'review-resume':        'powerful',
  'career-advice':        'powerful',
  'case-framework':       'powerful',
  'weekly-newsletter':    'powerful',
  'fact-verify':          'powerful',
};

// Per-tier provider preferences (ordered by preference)
const TIER_PROVIDERS = {
  fast:     ['groq', 'gemini', 'ollama', 'openai', 'anthropic'],
  balanced: ['openai', 'groq', 'anthropic', 'gemini', 'openrouter'],
  powerful: ['anthropic', 'openai', 'openrouter', 'groq'],
};

/**
 * Returns the preferred provider name for a given task.
 * Falls back to the configured primary if the tier provider isn't set.
 */
function routeTask(taskName) {
  const tier = TASK_TIER[taskName] || 'balanced';
  const preferred = TIER_PROVIDERS[tier] || [];

  // Pick first provider that has a key configured
  for (const name of preferred) {
    const p = cfg.providers[name];
    if (p && p.apiKey && p.apiKey !== 'ollama') return name;
    if (name === 'ollama') return name; // ollama never needs a key
  }

  return cfg.providers.primary || 'groq';
}

/**
 * Estimate cost for a completed AI call.
 * @param {string} provider
 * @param {number} promptTokens
 * @param {number} completionTokens
 * @returns {number} estimated USD cost
 */
function estimateCost(provider, promptTokens = 0, completionTokens = 0) {
  const rates = PROVIDER_COSTS[provider] || { input: 0, output: 0 };
  return (promptTokens / 1_000_000) * rates.input + (completionTokens / 1_000_000) * rates.output;
}

module.exports = { routeTask, estimateCost, TASK_TIER, TIER_PROVIDERS, PROVIDER_COSTS };
