const v1Prompts = require('../prompts');

const PROMPT_REGISTRY = {};

function registerPrompt(promptId, definition) {
  PROMPT_REGISTRY[promptId] = {
    ...definition,
    promptId,
    registeredAt: new Date().toISOString(),
    versions: definition.versions || [{
      version: '1.0',
      system: definition.system || '',
      user: definition.user || '',
      createdAt: new Date().toISOString(),
      metadata: definition.metadata || {},
    }],
  };
}

function getPrompt(promptId, version) {
  const entry = PROMPT_REGISTRY[promptId];
  if (!entry) return null;

  if (version) {
    const v = entry.versions.find((v) => v.version === version);
    return v ? { ...v, promptId, currentVersion: version } : null;
  }

  const active = entry.versions.find((v) => v.version === entry.activeVersion) || entry.versions[entry.versions.length - 1];
  return {
    ...active,
    promptId,
    currentVersion: active.version,
    metadata: entry.metadata,
  };
}

function getActiveVersion(promptId) {
  const entry = PROMPT_REGISTRY[promptId];
  if (!entry) return null;
  return entry.activeVersion || entry.versions[entry.versions.length - 1]?.version || '1.0';
}

function getAllVersions(promptId) {
  const entry = PROMPT_REGISTRY[promptId];
  if (!entry) return [];
  return entry.versions.map((v) => ({
    version: v.version,
    createdAt: v.createdAt,
    tags: v.tags || [],
  }));
}

function listPrompts(tag) {
  const entries = Object.entries(PROMPT_REGISTRY);
  if (tag) {
    return entries
      .filter(([, e]) => (e.tags || []).includes(tag) || (e.metadata?.tags || []).includes(tag))
      .map(([id, e]) => ({ promptId: id, name: e.name, tags: e.tags || [], activeVersion: e.activeVersion }));
  }
  return entries.map(([id, e]) => ({ promptId: id, name: e.name, tags: e.tags || [], activeVersion: e.activeVersion }));
}

function rollbackPrompt(promptId, version) {
  const entry = PROMPT_REGISTRY[promptId];
  if (!entry) return false;
  const v = entry.versions.find((v) => v.version === version);
  if (!v) return false;
  entry.activeVersion = version;
  return true;
}

function addVersion(promptId, versionData) {
  const entry = PROMPT_REGISTRY[promptId];
  if (!entry) return false;
  entry.versions.push({
    version: versionData.version,
    system: versionData.system || entry.versions[entry.versions.length - 1]?.system || '',
    user: versionData.user || entry.versions[entry.versions.length - 1]?.user || '',
    createdAt: new Date().toISOString(),
    tags: versionData.tags || [],
    metadata: versionData.metadata || {},
  });
  entry.activeVersion = versionData.version;
  return true;
}

const PROMPT_TASK_MAP = {
  'summarise-note':       { promptId: 'summarise-note',       tags: ['summarize', 'notes'] },
  'news-summary':         { promptId: 'news-summary',         tags: ['summarize', 'news'] },
  'moderation':           { promptId: 'moderate-post',        tags: ['moderation', 'administration'] },
  'resume-tip':           { promptId: 'resume-tip',           tags: ['resume', 'tips'] },
  'daily-reflection':     { promptId: 'daily-reflection',     tags: ['reflection', 'daily'] },
  'daily-briefing':       { promptId: 'daily-briefing',       tags: ['briefing', 'daily'] },
  'daily-case':           { promptId: 'daily-case',           tags: ['case', 'education'] },
  'company-enrichment':   { promptId: 'company-enrich',       tags: ['company', 'research'] },
  'interview-questions':  { promptId: 'interview-questions',  tags: ['interview', 'career'] },
  'planner-suggest':      { promptId: 'planner-suggest',      tags: ['planner', 'productivity'] },
  'chat':                 { promptId: 'chat',                 tags: ['chat', 'general'] },
  'review-resume':        { promptId: 'review-resume',        tags: ['resume', 'review'] },
  'career-advice':        { promptId: 'career-advice',        tags: ['career', 'coaching'] },
  'case-framework':       { promptId: 'case-framework',       tags: ['case', 'framework'] },
  'interview-simulator':  { promptId: 'interview-simulator',  tags: ['interview', 'simulation'] },
  'compare-companies':    { promptId: 'compare-companies',    tags: ['compare', 'companies'] },
  'weekly-newsletter':    { promptId: 'weekly-newsletter',    tags: ['newsletter', 'content'] },
  'news-enhance':         { promptId: 'news-enhance',         tags: ['news', 'enhancement'] },
  'fact-verify':          { promptId: 'fact-verify',          tags: ['verification'] },
  'plan':                 { promptId: 'planner-suggest',      tags: ['planner'] },
  'knowledge-graph':      { promptId: 'knowledge-graph',      tags: ['knowledge', 'graph'] },
};

function getPromptForTask(taskName) {
  const mapping = PROMPT_TASK_MAP[taskName];
  if (!mapping) return null;
  return getPrompt(mapping.promptId);
}

function getPromptForIntent(intent, taskName) {
  if (taskName) {
    const fromTask = getPromptForTask(taskName);
    if (fromTask) return fromTask;
  }

  const intentPromptMap = {
    explain:      'chat',
    summarize:    'news-summary',
    teach:        'daily-case',
    coach:        'chat',
    review:       'review-resume',
    compare:      'compare-companies',
    research:     'company-enrich',
    generate:     'weekly-newsletter',
    reason:       'fact-verify',
    brainstorm:   'chat',
    career:       'career-advice',
    resume:       'resume-tip',
    interview:    'interview-questions',
    planner:      'planner-suggest',
    reflection:   'daily-reflection',
    motivation:   'chat',
    'knowledge-graph': 'knowledge-graph',
  };

  const fallbackId = intentPromptMap[intent];
  if (fallbackId) return getPrompt(fallbackId);
  return getPrompt('chat');
}

function buildTypedPrompt(promptId, variables) {
  const prompt = getPrompt(promptId);
  if (!prompt) return null;

  let system = prompt.system;
  let user = prompt.user;

  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
      if (system) system = system.replace(placeholder, value || '');
      if (user) user = user.replace(placeholder, value || '');
    }
  }

  return { system, user, promptId, version: prompt.currentVersion };
}

module.exports = {
  registerPrompt,
  getPrompt,
  getActiveVersion,
  getAllVersions,
  listPrompts,
  rollbackPrompt,
  addVersion,
  PROMPT_REGISTRY,
  PROMPT_TASK_MAP,
  getPromptForTask,
  getPromptForIntent,
  buildTypedPrompt,
};
