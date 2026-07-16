const { validate } = require('../validator');

const HALLUCINATION_PHRASES_V2 = [
  'as of my knowledge cutoff',
  'i cannot verify',
  'i do not have access',
  'i\'m not sure',
  'i am not sure',
  'i don\'t know',
  'i cannot confirm',
  'hypothetically speaking',
  'to be honest, i',
  'i think',
  'i believe',
  'in my opinion',
  'it is possible that',
  'may be',
  'might be',
  'it could be',
  'i am not certain',
  'i have no information',
  'i cannot provide',
  'i am unable to',
  'unfortunately, i',
  'i apologize, but i',
  'i\'m sorry, but i',
  'as an ai',
  'as a language model',
  'as an ai language model',
  'i was not trained on',
  'my training data only',
  'i don\'t have real-time',
  'i don\'t have access to real-time',
  'beyond my knowledge cutoff',
];

const INTENT_SPECIFIC_CHECKS = {
  resume: {
    minLength: 100,
    checkKeywords: ['skill', 'experience', 'improve', 'suggestion', 'resume'],
  },
  interview: {
    minLength: 80,
    checkKeywords: ['question', 'answer', 'interview', 'prepare', 'framework'],
  },
  career: {
    minLength: 80,
    checkKeywords: ['career', 'role', 'company', 'sector', 'placement', 'opportunity'],
  },
  summarize: {
    minLength: 50,
    checkKeywords: ['summary', 'key', 'point', 'overview', 'conclusion'],
  },
  planner: {
    minLength: 40,
    checkKeywords: ['task', 'priority', 'focus', 'today', 'action', 'plan'],
  },
  reflection: {
    minLength: 60,
    checkKeywords: ['reflect', 'today', 'gratitude', 'challenge', 'growth'],
  },
  teach: {
    minLength: 100,
    checkKeywords: ['concept', 'framework', 'example', 'understand', 'approach'],
  },
  compare: {
    minLength: 80,
    checkKeywords: ['compare', 'versus', 'difference', 'recommend'],
  },
};

const PII_PATTERNS = [
  /\b\d{16}\b/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b[A-Z]{2}\d{6}\b/,
  /\b\d{10}\b/,
];

async function verifyResponse({ output, task, intent, sourceCount = 0, existingTitles = [], promptId, version }) {
  const text = typeof output === 'string' ? output : JSON.stringify(output);
  const issues = [];
  const warnings = [];

  const v1Result = validate({
    output,
    task: task || 'chat',
    sourceCount,
    existingTitles,
  });

  issues.push(...v1Result.issues);

  const hallucinationHits = HALLUCINATION_PHRASES_V2.filter((p) =>
    text.toLowerCase().includes(p)
  );
  if (hallucinationHits.length > 0) {
    warnings.push(`Hallucination risk (${hallucinationHits.length} phrases): ${hallucinationHits.slice(0, 3).join(', ')}`);
  }

  for (const re of PII_PATTERNS) {
    if (re.test(text)) {
      issues.push('Potential PII detected in output');
    }
  }

  const runsOnNewlines = text.split(/\n+/).filter((l) => l.trim().length > 0);
  if (runsOnNewlines.length < 2) {
    warnings.push('Response is very short or single line — may be incomplete');
  }

  if (intent) {
    const checks = INTENT_SPECIFIC_CHECKS[intent];
    if (checks) {
      if (text.length < checks.minLength) {
        issues.push(`Output too short for intent "${intent}" (${text.length} chars, minimum ${checks.minLength})`);
      }
      const hasKeywords = checks.checkKeywords.some((kw) => text.toLowerCase().includes(kw));
      if (!hasKeywords && text.length > 20) {
        warnings.push(`Response may not address intent "${intent}" — expected keywords not found`);
      }
    }
  }

  const escapedQuotes = (text.match(/\\"/g) || []).length;
  if (escapedQuotes > 10) {
    warnings.push(`Response has ${escapedQuotes} escaped quotes — possible JSON serialization issue`);
  }

  let confidence = v1Result.confidence;
  if (hallucinationHits.length > 0) confidence -= 0.1 * hallucinationHits.length;
  confidence = Math.max(0, Math.min(1, confidence));

  const { autoPublish, minimum } = require('../../config/automation').confidence;
  const passesMinimum = confidence >= minimum && issues.filter((i) =>
    i.toLowerCase().includes('unsafe') || i.toLowerCase().includes('pii')
  ).length === 0;
  const passesAutoPublish = passesMinimum && confidence >= autoPublish && warnings.length <= 2;

  return {
    pass: passesMinimum,
    confidence: parseFloat(confidence.toFixed(3)),
    autoPublish: passesAutoPublish,
    issues,
    warnings,
    hallucinationHits,
    v1Result,
    status: !passesMinimum ? 'failed' : !passesAutoPublish ? 'pending_review' : 'published',
    promptVersion: version || null,
    promptId: promptId || null,
  };
}

function needsRetry(verification) {
  if (verification.status === 'failed') return true;
  if (verification.confidence < 0.3) return true;
  if (verification.issues.some((i) => i.toLowerCase().includes('pii'))) return false;
  return false;
}

module.exports = {
  verifyResponse,
  needsRetry,
  HALLUCINATION_PHRASES_V2,
  INTENT_SPECIFIC_CHECKS,
};
