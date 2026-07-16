const { getAvailableModels } = require('./modelRegistry');
const { computeRequiredCapabilities, findBestModels } = require('./capabilityEngine');

function selectCheapestModels(capabilities, availableModels, intent) {
  const candidates = findBestModels(capabilities, availableModels, 20);

  return candidates
    .map((c) => ({
      ...c,
      costScore: c.capabilities?.costScore || 50,
    }))
    .filter((c) => c.costScore >= 30)
    .sort((a, b) => b.costScore - a.costScore)
    .slice(0, 5);
}

function estimateCost({ provider, model, promptTokens, completionTokens, estimatedCostUsd }) {
  let costPer1kPrompt = 0;
  let costPer1kCompletion = 0;

  switch (provider) {
    case 'openai':
      costPer1kPrompt = model?.includes('gpt-4') ? 0.03 : 0.01;
      costPer1kCompletion = model?.includes('gpt-4') ? 0.06 : 0.02;
      break;
    case 'anthropic':
      costPer1kPrompt = model?.includes('sonnet') ? 0.015 : 0.008;
      costPer1kCompletion = model?.includes('sonnet') ? 0.075 : 0.024;
      break;
    case 'groq':
      costPer1kPrompt = 0.001;
      costPer1kCompletion = 0.002;
      break;
    case 'google':
      costPer1kPrompt = 0.001;
      costPer1kCompletion = 0.002;
      break;
    case 'cohere':
      costPer1kPrompt = 0.005;
      costPer1kCompletion = 0.015;
      break;
    case 'mistral':
      costPer1kPrompt = 0.002;
      costPer1kCompletion = 0.006;
      break;
    default:
      costPer1kPrompt = 0.005;
      costPer1kCompletion = 0.015;
  }

  const estimatedPrompt = (promptTokens || 0) / 1000 * costPer1kPrompt;
  const estimatedCompletion = (completionTokens || 0) / 1000 * costPer1kCompletion;

  return estimatedCostUsd || parseFloat((estimatedPrompt + estimatedCompletion).toFixed(6));
}

function getCostProfile(provider, model) {
  switch (provider) {
    case 'groq': return { tier: 'budget', costPerRequest: 0.00005, costScore: 95 };
    case 'google': return { tier: 'budget', costPerRequest: 0.00005, costScore: 90 };
    case 'mistral': return { tier: 'budget', costPerRequest: 0.00015, costScore: 85 };
    case 'cohere': return { tier: 'moderate', costPerRequest: 0.0005, costScore: 70 };
    case 'openai':
      if (model?.includes('gpt-4')) return { tier: 'premium', costPerRequest: 0.002, costScore: 20 };
      return { tier: 'moderate', costPerRequest: 0.0005, costScore: 60 };
    case 'anthropic':
      return { tier: 'premium', costPerRequest: 0.003, costScore: 15 };
    default: return { tier: 'moderate', costPerRequest: 0.0005, costScore: 50 };
  }
}

module.exports = {
  selectCheapestModels,
  estimateCost,
  getCostProfile,
};
