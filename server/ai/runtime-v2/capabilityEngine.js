const { INTENT_REQUIREMENTS } = require('./intentEngine');
const { MODELS } = require('./modelRegistry');

const CAPABILITY_NAMES = [
  'reasoningScore',
  'writingScore',
  'codingScore',
  'planningScore',
  'summarizationScore',
  'creativityScore',
  'speedScore',
  'costScore',
  'latencyScore',
  'reliabilityScore',
];

function computeRequiredCapabilities(intent, contextSize = 0, complexity = 0.5) {
  const requirements = INTENT_REQUIREMENTS[intent] || INTENT_REQUIREMENTS.explain;
  const capabilities = {
    supportsJson: requirements.supportsJson,
    supportsVision: false,
    supportsStreaming: true,
    minContextWindow: requirements.minContextWindow,
    actualContextSize: contextSize,
    complexity,
    requiredReasoning: 50,
    requiredWriting: 50,
    requiredCoding: 0,
    requiredPlanning: 30,
    requiredSummarization: 30,
    requiredCreativity: 30,
    minSpeed: 30,
    minReliability: 50,
  };

  const intentThresholds = {
    explain:       { reasoning: 60, writing: 50 },
    summarize:     { summarization: 60, writing: 50 },
    teach:         { reasoning: 65, writing: 60, planning: 50 },
    coach:         { reasoning: 60, writing: 50, planning: 50, creativity: 40 },
    review:        { reasoning: 70, writing: 55, summarization: 50 },
    compare:       { reasoning: 65, writing: 50, planning: 50 },
    research:      { reasoning: 70, writing: 50, planning: 50 },
    generate:      { creativity: 65, writing: 60, reasoning: 50 },
    reason:        { reasoning: 80, planning: 50 },
    brainstorm:    { creativity: 70, reasoning: 60, writing: 50 },
    career:        { reasoning: 60, writing: 60, planning: 50 },
    resume:        { writing: 65, reasoning: 60, planning: 50, summarization: 50 },
    interview:     { reasoning: 65, writing: 50, planning: 60 },
    planner:       { planning: 70, reasoning: 60, writing: 50 },
    reflection:    { writing: 55, creativity: 55, reasoning: 40 },
    motivation:    { creativity: 60, writing: 55 },
    coding:        { coding: 75, reasoning: 70, planning: 50 },
    'knowledge-graph': { reasoning: 60, planning: 55, writing: 50 },
    administration: { summarization: 50, writing: 50, reasoning: 40 },
  };

  const thresholds = intentThresholds[intent] || {};
  if (thresholds.reasoning !== undefined) capabilities.requiredReasoning = thresholds.reasoning;
  if (thresholds.writing !== undefined) capabilities.requiredWriting = thresholds.writing;
  if (thresholds.coding !== undefined) capabilities.requiredCoding = thresholds.coding;
  if (thresholds.planning !== undefined) capabilities.requiredPlanning = thresholds.planning;
  if (thresholds.summarization !== undefined) capabilities.requiredSummarization = thresholds.summarization;
  if (thresholds.creativity !== undefined) capabilities.requiredCreativity = thresholds.creativity;

  if (complexity > 0.7) {
    capabilities.requiredReasoning = Math.min(capabilities.requiredReasoning + 15, 95);
    capabilities.requiredWriting = Math.min(capabilities.requiredWriting + 10, 95);
    capabilities.requiredPlanning = Math.min(capabilities.requiredPlanning + 10, 95);
  }

  return capabilities;
}

function scoreModelFit(modelKey, capabilities) {
  const model = MODELS[modelKey];
  if (!model) return 0;

  if (capabilities.supportsJson && !model.supportsJson) return 0;
  if (capabilities.supportsVision && !model.supportsVision) return 0;
  if (capabilities.supportsStreaming && !model.supportsStreaming) return 0;
  if (model.contextWindow < capabilities.minContextWindow) return 0;
  if (model.contextWindow < capabilities.actualContextSize) return 0;

  let penalty = 0;
  if (model.reasoningScore < capabilities.requiredReasoning) penalty += (capabilities.requiredReasoning - model.reasoningScore) * 2;
  if (model.writingScore < capabilities.requiredWriting) penalty += (capabilities.requiredWriting - model.writingScore) * 2;
  if (model.codingScore < capabilities.requiredCoding) penalty += (capabilities.requiredCoding - model.codingScore) * 2;
  if (model.planningScore < capabilities.requiredPlanning) penalty += (capabilities.requiredPlanning - model.planningScore) * 2;
  if (model.summarizationScore < capabilities.requiredSummarization) penalty += (capabilities.requiredSummarization - model.summarizationScore) * 2;
  if (model.creativityScore < capabilities.requiredCreativity) penalty += (capabilities.requiredCreativity - model.creativityScore) * 2;

  if (model.speedScore < capabilities.minSpeed) penalty += (capabilities.minSpeed - model.speedScore) * 1;
  if (model.reliabilityScore < capabilities.minReliability) penalty += (capabilities.minReliability - model.reliabilityScore) * 1.5;

  const baseScore = (
    model.reasoningScore * 0.15 +
    model.writingScore * 0.15 +
    model.codingScore * 0.05 +
    model.planningScore * 0.10 +
    model.summarizationScore * 0.10 +
    model.creativityScore * 0.05 +
    model.speedScore * 0.10 +
    model.costScore * 0.10 +
    model.latencyScore * 0.05 +
    model.reliabilityScore * 0.15
  );

  return Math.max(0, baseScore - penalty * 0.5);
}

function findBestModels(capabilities, availableModels, count = 3) {
  const scored = availableModels
    .map((m) => ({
      key: m.key,
      provider: m.provider,
      model: m.model,
      score: scoreModelFit(m.key, capabilities),
      capabilities: m,
    }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count);
}

module.exports = {
  CAPABILITY_NAMES,
  computeRequiredCapabilities,
  scoreModelFit,
  findBestModels,
};
