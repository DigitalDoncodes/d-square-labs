const intentEngine = require('./intentEngine');
const contextBuilder = require('./contextBuilder');
const capabilityEngine = require('./capabilityEngine');
const modelRouterV2 = require('./modelRouterV2');
const promptRegistry = require('./promptRegistry');
const modelRegistry = require('./modelRegistry');
const promptVersionManager = require('./promptVersionManager');
const responseVerifierV2 = require('./responseVerifierV2');
const telemetryEngine = require('./telemetryEngine');
const circuitBreaker = require('./circuitBreaker');
const cacheLayer = require('./cacheLayer');
const costOptimizer = require('./costOptimizer');
const latencyOptimizer = require('./latencyOptimizer');
const knowledgeGraphAdapter = require('./knowledgeGraphAdapter');
const memoryAdapter = require('./memoryAdapter');
const learningEngine = require('./learningEngine');
const cfg = require('../../config/automation');
const { getProvider } = require('../providers');
const usageMeter = require('../usageMeter');

const PAGE_ACTIONS = {
  'dashboard:view': {
    intent: 'explain',
    contextKeys: ['memory', 'planner', 'study', 'placement', 'career', 'finance'],
    promptType: 'dashboard-insights',
    responseFormat: 'json',
    requires: null,
  },
  'dashboard:detect-problems': {
    intent: 'reason',
    contextKeys: ['planner', 'study', 'memory', 'career', 'placement'],
    promptType: 'dashboard-problem-detect',
    responseFormat: 'json',
    requires: null,
  },
  'dashboard:recommend': {
    intent: 'recommendation',
    contextKeys: ['memory', 'planner', 'study', 'career'],
    promptType: 'dashboard-recommend',
    responseFormat: 'json',
    requires: null,
  },
  'planner:optimize': {
    intent: 'planner',
    contextKeys: ['planner', 'memory'],
    promptType: 'planner-optimize',
    responseFormat: 'json',
    requires: 'AI_PLANNER_SUGGEST',
  },
  'notes:summarize': {
    intent: 'summarize',
    contextKeys: ['note'],
    promptType: 'summarise-note',
    responseFormat: 'json',
    requires: 'AI_SUMMARISE',
  },
  'notes:flashcard': {
    intent: 'generate',
    contextKeys: ['note', 'memory'],
    promptType: 'flashcard-generate',
    responseFormat: 'json',
    requires: 'FLASHCARD_GENERATE',
  },
  'notes:quiz': {
    intent: 'generate',
    contextKeys: ['note', 'memory'],
    promptType: 'quiz-generate',
    responseFormat: 'json',
    requires: 'QUIZ_GENERATE',
  },
  'resume:ats': {
    intent: 'resume',
    contextKeys: ['resume', 'memory'],
    promptType: 'resume-ats',
    responseFormat: 'json',
    requires: 'RESUME_ATS',
  },
  'resume:review': {
    intent: 'review',
    contextKeys: ['resume', 'memory'],
    promptType: 'review-resume',
    responseFormat: 'json',
    requires: 'AI_RESUME_REVIEW',
  },
  'finance:advise': {
    intent: 'explain',
    contextKeys: ['finance', 'memory'],
    promptType: 'finance-assist',
    responseFormat: 'json',
    requires: 'FINANCE_ASSIST',
  },
  'career:roadmap': {
    intent: 'career',
    contextKeys: ['career', 'resume', 'placement', 'memory'],
    promptType: 'career-advice',
    responseFormat: 'json',
    requires: 'AI_CAREER_ADVICE',
  },
  'interview:coach': {
    intent: 'interview',
    contextKeys: ['resume', 'memory', 'career'],
    promptType: 'interview-simulator',
    responseFormat: 'json',
    requires: 'AI_INTERVIEW_SIMULATOR',
  },
  'company:research': {
    intent: 'research',
    contextKeys: ['company', 'memory'],
    promptType: 'company-research',
    responseFormat: 'json',
    requires: 'COMPANY_RESEARCH',
  },
  'compare:companies': {
    intent: 'compare',
    contextKeys: ['companies', 'memory'],
    promptType: 'compare-companies',
    responseFormat: 'json',
    requires: 'AI_COMPARE_COMPANIES',
  },
  'recommend:next': {
    intent: 'recommendation',
    contextKeys: ['memory', 'planner', 'study', 'career', 'finance'],
    promptType: 'dashboard-recommend',
    responseFormat: 'json',
    requires: null,
  },
  'study:case-framework': {
    intent: 'teach',
    contextKeys: ['memory'],
    promptType: 'case-framework',
    responseFormat: 'text',
    requires: null,
  },
  'chat:message': {
    intent: 'explain',
    contextKeys: ['all'],
    promptType: 'chat',
    responseFormat: 'text',
    requires: null,
  },
};

async function enhance({ userId, page, action, data = {}, tier, strategy }) {
  const startTime = Date.now();
  const pageAction = `${page}:${action}`;
  const actionDef = PAGE_ACTIONS[pageAction];

  if (!actionDef) {
    throw Object.assign(new Error(`Unknown enhancement: ${pageAction}`), { statusCode: 400, name: 'ValidationError' });
  }

  const context = await contextBuilder.buildContext(userId, {
    contextKeys: actionDef.contextKeys,
    ...(data.noteId ? { noteIds: [data.noteId] } : {}),
    ...(data.companyId ? { companyIds: [data.companyId] } : {}),
    ...(data.companySlugA && data.companySlugB ? { companySlugs: [data.companySlugA, data.companySlugB] } : {}),
  });

  const intent = { primaryIntent: actionDef.intent, confidence: 0.9, source: 'page-action' };
  const capabilities = capabilityEngine.computeRequiredCapabilities(
    intent.primaryIntent,
    data.contextSize || context.contextSize || 0,
    data.complexity || 0.5
  );

  const routing = await modelRouterV2.routeRequest({
    text: data.text || data.query || '',
    taskName: actionDef.promptType,
    userId,
    tier: tier || context?.user?.tier || 'free',
    contextSize: capabilities.actualContextSize,
    complexity: capabilities.complexity,
    strategy: strategy || 'auto-select',
  });

  const prompt = promptRegistry.getPromptForIntent(intent.primaryIntent, actionDef.promptType) || {
    system: '',
    user: '',
    promptId: actionDef.promptType,
  };
  const currentVersion = prompt?.currentVersion || '1.0';

  const providerInstance = await modelRouterV2.resolveProvider(routing.provider);

  let rawOutput;
  let verification;
  let promptTokens, completionTokens, totalTokens;
  let success = false;

  try {
    const response = await providerInstance.generate({
      system: prompt.system || '',
      user: buildUserPrompt(prompt.user || '', actionDef.promptType, data),
      context: context.text,
      query: data.text || data.query || data.message || '',
      taskName: actionDef.promptType,
      intent: intent.primaryIntent,
      userId,
    });

    rawOutput = response.output || response.text || response;
    promptTokens = response.promptTokens || response.usage?.promptTokens || 0;
    completionTokens = response.completionTokens || response.usage?.completionTokens || 0;
    totalTokens = response.totalTokens || response.usage?.totalTokens || (promptTokens + completionTokens);

    verification = await responseVerifierV2.verifyResponse({
      output: rawOutput,
      task: actionDef.promptType,
      intent: intent.primaryIntent,
      sourceCount: data.sourceCount,
      existingTitles: data.existingTitles,
      promptId: prompt.promptId,
      version: currentVersion,
    });

    if (verification.status === 'failed') {
      rawOutput = null;
    }

    success = verification.status !== 'failed';
  } catch (err) {
    circuitBreaker.recordFailure(routing.provider, 'provider_unavailable');
    rawOutput = null;
    verification = {
      pass: false, status: 'failed', confidence: 0,
      issues: [err.message], warnings: [], hallucinationHits: [],
    };
    promptTokens = 0; completionTokens = 0; totalTokens = 0;
  }

  const latencyMs = Date.now() - startTime;
  const cost = costOptimizer.estimateCost({
    provider: routing.provider, model: routing.model,
    promptTokens, completionTokens, estimatedCostUsd: data.estimatedCostUsd,
  });

  const formatted = actionDef.responseFormat === 'json'
    ? parseEnhancement(rawOutput, action)
    : { text: rawOutput, confidence: verification?.confidence };

  telemetryEngine.recordCall({
    userId, task: pageAction, intent: intent.primaryIntent,
    provider: routing.provider, model: routing.model,
    tokensUsed: totalTokens, promptTokens, completionTokens,
    latencyMs, estimatedCostUsd: cost,
    confidence: verification?.confidence || 0,
    status: success ? 'success' : 'failed',
    validationIssues: verification?.issues || [],
    promptId: prompt.promptId, promptVersion: currentVersion,
    retryAttempts: 0, contextSize: capabilities.actualContextSize,
    strategy: strategy || null,
  });

  if (success) {
    // Credit metering — only successful generations charge the student.
    usageMeter.chargeCredits({
      userId, tier,
      model: routing.model, provider: routing.provider,
      promptTokens, completionTokens,
      task: pageAction, latencyMs,
    }).catch(() => {});

    await memoryAdapter.saveMemory(userId, {
      type: 'ai-enhancement',
      key: `${pageAction}:${Date.now()}`,
      value: { page, action, confidence: verification?.confidence },
      tags: ['ai-enhancement', page, action],
    });
  }

  return {
    page,
    action,
    insight: formatted,
    verification: {
      status: verification.status,
      confidence: verification.confidence,
    },
    routing: {
      provider: routing.provider,
      model: routing.model,
      strategy: routing.routingDecision?.strategy || 'auto-select',
    },
    cost,
    latencyMs,
    timestamp: new Date().toISOString(),
  };
}

function buildUserPrompt(template, promptType, data) {
  if (!template) {
    const dataStr = Object.entries(data)
      .filter(([k]) => !['noteId', 'companyId', 'companySlugA', 'companySlugB', 'contextSize', 'complexity', 'estimatedCostUsd', 'sourceCount', 'existingTitles'].includes(k))
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
    return dataStr || '';
  }
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value ?? ''));
  }
  return result;
}

function parseEnhancement(raw, action) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    if (action === 'view') {
      const insight = raw.replace(/^["'\s]+|["'\s]+$/g, '').slice(0, 500);
      return { insight, raw };
    }
    return { text: raw.slice(0, 2000), raw };
  }
}

async function healthCheck() {
  const modelCount = modelRegistry.getAvailableModels().length;
  const providerHealth = {};
  const providers = ['nvidia', 'ollama', 'groq', 'openai', 'anthropic', 'gemini'];
  for (const p of providers) {
    const cbState = circuitBreaker.getState(p);
    providerHealth[p] = {
      available: circuitBreaker.isAvailable(p),
      circuitState: cbState.currentState,
      failures: cbState.failureCount,
    };
  }
  return {
    status: 'healthy',
    modules: {
      intentEngine: true, modelRegistry: modelCount > 0,
      contextBuilder: true, capabilityEngine: true,
      modelRouterV2: true, promptRegistry: true,
      responseVerifierV2: true, telemetryEngine: true,
    },
    stats: {
      pageActions: Object.keys(PAGE_ACTIONS).length,
      registeredModels: modelCount,
      providerHealth,
    },
  };
}

module.exports = {
  enhance,
  healthCheck,
  PAGE_ACTIONS,
};
