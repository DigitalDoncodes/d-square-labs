const v1Runtime = require('../index');
const v2Engine = require('./studentIntelligenceEngine');
const telemetryEngine = require('./telemetryEngine');
const learningEngine = require('./learningEngine');

const USE_V2_FOR_INTENTS = [
  'coach',
  'explain',
  'research',
  'brainstorm',
  'compare',
  'motivation',
];

const V2_ONLY_TASKS = [
  'knowledge-graph',
  'fact-verify',
  'company-enrich',
];

const MIGRATION_STATE = {
  mode: 'parallel',
  v2CallCount: 0,
  v1CallCount: 0,
  fallbackCount: 0,
  startedAt: Date.now(),
};

function getMigrationState() {
  return { ...MIGRATION_STATE };
}

function isV2Only(intent, taskName) {
  if (taskName && V2_ONLY_TASKS.includes(taskName)) return true;
  return USE_V2_FOR_INTENTS.includes(intent);
}

function setMigrationMode(mode) {
  if (!['parallel', 'v2-only', 'v1-only'].includes(mode)) return false;
  MIGRATION_STATE.mode = mode;
  return true;
}

async function route(options) {
  const {
    userId,
    text,
    taskName,
  } = options;

  let intent = null;
  try {
    const intentEngine = require('./intentEngine');
    intent = intentEngine.classifyTask({ text, taskName, userId });
  } catch {
    intent = { primaryIntent: taskName || 'chat', confidence: 0.5 };
  }

  const useV2 = _shouldUseV2(intent.primaryIntent, taskName);

  if (useV2) {
    try {
      MIGRATION_STATE.v2CallCount++;
      const result = await v2Engine.processIntelligenceRequest(options);
      return {
        ...result,
        migration: { version: 'v2', mode: MIGRATION_STATE.mode },
      };
    } catch (err) {
      MIGRATION_STATE.fallbackCount++;
      _logFallback(err, intent.primaryIntent);
    }
  }

  MIGRATION_STATE.v1CallCount++;
  const v1Result = await v1Runtime(options);

  return {
    ...v1Result,
    migration: { version: 'v1', mode: MIGRATION_STATE.mode, fallback: useV2 || undefined },
  };
}

function _shouldUseV2(intent, taskName) {
  switch (MIGRATION_STATE.mode) {
    case 'v2-only':
      return true;
    case 'v1-only':
      return false;
    case 'parallel':
    default:
      if (taskName && V2_ONLY_TASKS.includes(taskName)) return true;
      return USE_V2_FOR_INTENTS.includes(intent);
  }
}

function _logFallback(err, intent) {
  try {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', '..', 'logs', 'migration-fallback.log');
    const entry = `[${new Date().toISOString()}] V2 fallback for intent="${intent}": ${err.message}\n`;
    fs.appendFileSync(logPath, entry);
  } catch {
  }
}

async function migrateToV2(options) {
  setMigrationMode('parallel');
  MIGRATION_STATE.startedAt = Date.now();
  MIGRATION_STATE.v2CallCount = 0;
  MIGRATION_STATE.v1CallCount = 0;
  MIGRATION_STATE.fallbackCount = 0;

  return route(options);
}

module.exports = {
  route,
  migrateToV2,
  setMigrationMode,
  getMigrationState,
  USE_V2_FOR_INTENTS,
  V2_ONLY_TASKS,
};
