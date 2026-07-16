const { getAvailableModels } = require('./modelRegistry');
const { computeRequiredCapabilities, findBestModels } = require('./capabilityEngine');

const LATENCY_PROFILES = {
  groq: { avgResponseMs: 400, tier: 'fast', latencyScore: 95 },
  google: { avgResponseMs: 600, tier: 'fast', latencyScore: 85 },
  mistral: { avgResponseMs: 800, tier: 'moderate', latencyScore: 75 },
  openai: {
    avgResponseMs: 1200,
    tier: 'moderate',
    latencyScore: 60,
    modelOverrides: { 'gpt-4': { avgResponseMs: 2000, latencyScore: 35 } },
  },
  anthropic: { avgResponseMs: 1800, tier: 'slow', latencyScore: 40 },
  cohere: { avgResponseMs: 1000, tier: 'moderate', latencyScore: 55 },
};

function selectFastestModels(capabilities, availableModels, intent) {
  const candidates = findBestModels(capabilities, availableModels, 20);

  return candidates
    .map((c) => {
      const profile = LATENCY_PROFILES[c.provider] || { avgResponseMs: 1000, latencyScore: 50 };
      if (profile.modelOverrides?.[c.model]) {
        return { ...c, ...profile.modelOverrides[c.model] };
      }
      return { ...c, avgResponseMs: profile.avgResponseMs, latencyScore: profile.latencyScore };
    })
    .filter((c) => c.latencyScore >= 30)
    .sort((a, b) => a.avgResponseMs - b.avgResponseMs)
    .slice(0, 5);
}

function estimateLatency(provider, model) {
  const profile = LATENCY_PROFILES[provider];
  if (!profile) return 1000;
  if (profile.modelOverrides?.[model]) return profile.modelOverrides[model].avgResponseMs;
  return profile.avgResponseMs;
}

function getLatencyProfile(provider) {
  return LATENCY_PROFILES[provider] || { avgResponseMs: 1000, tier: 'unknown', latencyScore: 50 };
}

module.exports = {
  selectFastestModels,
  estimateLatency,
  getLatencyProfile,
  LATENCY_PROFILES,
};
