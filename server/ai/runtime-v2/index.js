const studentIntelligenceEngine = require('./studentIntelligenceEngine');
const migration = require('./migration');
const intentEngine = require('./intentEngine');
const modelRegistry = require('./modelRegistry');
const contextBuilder = require('./contextBuilder');
const capabilityEngine = require('./capabilityEngine');
const modelRouterV2 = require('./modelRouterV2');
const promptRegistry = require('./promptRegistry');
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

async function process(options) {
  return migration.route(options);
}

async function processWithV2(options) {
  return studentIntelligenceEngine.processIntelligenceRequest(options);
}

async function healthCheck() {
  return studentIntelligenceEngine.healthCheck();
}

module.exports = {
  process,
  processWithV2,
  healthCheck,
  migration,
  intentEngine,
  modelRegistry,
  contextBuilder,
  capabilityEngine,
  modelRouterV2,
  promptRegistry,
  promptVersionManager,
  responseVerifierV2,
  telemetryEngine,
  circuitBreaker,
  cacheLayer,
  costOptimizer,
  latencyOptimizer,
  knowledgeGraphAdapter,
  memoryAdapter,
  learningEngine,
};
