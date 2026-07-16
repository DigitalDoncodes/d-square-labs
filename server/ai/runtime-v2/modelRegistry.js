const cfg = require('../../config/automation');

const MODELS = {
  'llama-3.3-70b-versatile': {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    contextWindow: 128000,
    supportsVision: false,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 80,
    writingScore: 78,
    codingScore: 72,
    planningScore: 75,
    summarizationScore: 82,
    creativityScore: 70,
    speedScore: 90,
    costScore: 85,
    latencyScore: 88,
    reliabilityScore: 82,
    healthScore: 85,
    availability: 0.98,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    contextWindow: 128000,
    supportsVision: true,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 80,
    writingScore: 85,
    codingScore: 82,
    planningScore: 78,
    summarizationScore: 88,
    creativityScore: 75,
    speedScore: 85,
    costScore: 92,
    latencyScore: 85,
    reliabilityScore: 92,
    healthScore: 90,
    availability: 0.995,
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    contextWindow: 128000,
    supportsVision: true,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 92,
    writingScore: 92,
    codingScore: 90,
    planningScore: 88,
    summarizationScore: 90,
    creativityScore: 85,
    speedScore: 75,
    costScore: 50,
    latencyScore: 72,
    reliabilityScore: 93,
    healthScore: 92,
    availability: 0.995,
  },
  'claude-haiku-4-5-20251001': {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    contextWindow: 200000,
    supportsVision: true,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 82,
    writingScore: 85,
    codingScore: 80,
    planningScore: 80,
    summarizationScore: 85,
    creativityScore: 78,
    speedScore: 85,
    costScore: 82,
    latencyScore: 82,
    reliabilityScore: 88,
    healthScore: 86,
    availability: 0.99,
  },
  'claude-sonnet-4-20250514': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    contextWindow: 200000,
    supportsVision: true,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 95,
    writingScore: 95,
    codingScore: 93,
    planningScore: 92,
    summarizationScore: 92,
    creativityScore: 90,
    speedScore: 72,
    costScore: 35,
    latencyScore: 68,
    reliabilityScore: 92,
    healthScore: 90,
    availability: 0.99,
  },
  'gemini-2.0-flash': {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    contextWindow: 1048576,
    supportsVision: true,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 78,
    writingScore: 75,
    codingScore: 80,
    planningScore: 72,
    summarizationScore: 80,
    creativityScore: 72,
    speedScore: 92,
    costScore: 95,
    latencyScore: 90,
    reliabilityScore: 85,
    healthScore: 82,
    availability: 0.97,
  },
  'meta-llama/llama-3.3-70b-instruct': {
    provider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct',
    contextWindow: 128000,
    supportsVision: false,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 78,
    writingScore: 75,
    codingScore: 70,
    planningScore: 72,
    summarizationScore: 78,
    creativityScore: 68,
    speedScore: 82,
    costScore: 78,
    latencyScore: 75,
    reliabilityScore: 72,
    healthScore: 74,
    availability: 0.95,
  },
  'llama3.2': {
    provider: 'ollama',
    model: 'llama3.2',
    contextWindow: 8192,
    supportsVision: false,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 55,
    writingScore: 52,
    codingScore: 50,
    planningScore: 48,
    summarizationScore: 58,
    creativityScore: 45,
    speedScore: 95,
    costScore: 100,
    latencyScore: 95,
    reliabilityScore: 70,
    healthScore: 65,
    availability: 0.90,
  },
  'meta/llama-3.3-70b-instruct': {
    provider: 'nvidia',
    model: 'meta/llama-3.3-70b-instruct',
    contextWindow: 128000,
    supportsVision: false,
    supportsJson: true,
    supportsStreaming: true,
    reasoningScore: 78,
    writingScore: 75,
    codingScore: 70,
    planningScore: 72,
    summarizationScore: 78,
    creativityScore: 68,
    speedScore: 80,
    costScore: 78,
    latencyScore: 76,
    reliabilityScore: 76,
    healthScore: 75,
    availability: 0.95,
  },
};

const INTENT_CAPABILITY_WEIGHTS = {
  explain:       { reasoningScore: 0.3, writingScore: 0.3, summarizationScore: 0.2, planningScore: 0.1, creativityScore: 0.1 },
  summarize:     { summarizationScore: 0.5, writingScore: 0.3, reasoningScore: 0.1, speedScore: 0.1 },
  teach:         { reasoningScore: 0.3, writingScore: 0.3, planningScore: 0.2, summarizationScore: 0.1, creativityScore: 0.1 },
  coach:         { reasoningScore: 0.3, writingScore: 0.2, planningScore: 0.2, creativityScore: 0.2, summarizationScore: 0.1 },
  review:        { reasoningScore: 0.4, writingScore: 0.2, summarizationScore: 0.2, planningScore: 0.1, codingScore: 0.1 },
  compare:       { reasoningScore: 0.4, writingScore: 0.2, planningScore: 0.2, summarizationScore: 0.1, creativityScore: 0.1 },
  research:      { reasoningScore: 0.4, writingScore: 0.2, planningScore: 0.2, summarizationScore: 0.1, codingScore: 0.1 },
  generate:      { creativityScore: 0.3, writingScore: 0.3, reasoningScore: 0.2, planningScore: 0.1, summarizationScore: 0.1 },
  reason:        { reasoningScore: 0.5, planningScore: 0.2, writingScore: 0.1, creativityScore: 0.1, summarizationScore: 0.1 },
  brainstorm:    { creativityScore: 0.4, reasoningScore: 0.3, writingScore: 0.2, planningScore: 0.1 },
  career:        { reasoningScore: 0.3, writingScore: 0.3, planningScore: 0.2, summarizationScore: 0.1, creativityScore: 0.1 },
  resume:        { writingScore: 0.3, reasoningScore: 0.3, planningScore: 0.2, summarizationScore: 0.1, creativityScore: 0.1 },
  interview:     { reasoningScore: 0.3, writingScore: 0.2, planningScore: 0.3, creativityScore: 0.1, summarizationScore: 0.1 },
  planner:       { planningScore: 0.4, reasoningScore: 0.3, writingScore: 0.2, summarizationScore: 0.1 },
  reflection:    { writingScore: 0.3, creativityScore: 0.3, reasoningScore: 0.2, summarizationScore: 0.1, planningScore: 0.1 },
  motivation:    { creativityScore: 0.4, writingScore: 0.3, summarizationScore: 0.2, reasoningScore: 0.1 },
  coding:        { codingScore: 0.5, reasoningScore: 0.3, planningScore: 0.1, writingScore: 0.1 },
  'knowledge-graph': { reasoningScore: 0.3, planningScore: 0.3, writingScore: 0.2, summarizationScore: 0.1, creativityScore: 0.1 },
  administration: { summarizationScore: 0.3, writingScore: 0.3, reasoningScore: 0.2, planningScore: 0.1, speedScore: 0.1 },
};

function getModel(modelKey) {
  return MODELS[modelKey] || null;
}

function findModelsByProvider(providerName) {
  return Object.entries(MODELS)
    .filter(([, m]) => m.provider === providerName)
    .map(([key, m]) => ({ key, ...m }));
}

function scoreModelForIntent(modelKey, intent) {
  const model = MODELS[modelKey];
  if (!model) return 0;
  const weights = INTENT_CAPABILITY_WEIGHTS[intent];
  if (!weights) return model.writingScore;
  let score = 0;
  for (const [capability, weight] of Object.entries(weights)) {
    const val = model[capability] || 50;
    score += val * weight;
  }
  return Math.round(score);
}

function rankModelsForIntent(intent, count = 3) {
  const scored = Object.keys(MODELS).map((key) => ({
    key,
    provider: MODELS[key].provider,
    model: MODELS[key].model,
    score: scoreModelForIntent(key, intent),
    capabilities: MODELS[key],
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, count);
}

function listAllModels() {
  return Object.entries(MODELS).map(([key, m]) => ({ key, ...m }));
}

function getAvailableModels() {
  return Object.entries(MODELS)
    .filter(([, m]) => {
      const providerCfg = cfg.providers[m.provider];
      if (!providerCfg) return false;
      if (m.provider === 'ollama') return true;
      return Boolean(providerCfg.apiKey);
    })
    .map(([key, m]) => ({ key, ...m }));
}

module.exports = {
  MODELS,
  INTENT_CAPABILITY_WEIGHTS,
  getModel,
  findModelsByProvider,
  scoreModelForIntent,
  rankModelsForIntent,
  listAllModels,
  getAvailableModels,
};
