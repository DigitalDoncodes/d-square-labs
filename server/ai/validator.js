/**
 * Phase 6 + 12 — Confidence System & Quality Assurance
 * Every AI output passes through validate() before being published.
 * Returns { pass, confidence, issues[] }.
 */

const cfg = require('../config/automation');

// ── Hallucination risk indicators ─────────────────────────────────────────

const HALLUCINATION_PHRASES = [
  'as of my knowledge cutoff',
  'i cannot verify',
  'i do not have access',
  'i\'m not sure',
  'i am not sure',
  'i don\'t know',
  'i cannot confirm',
  'hypothetically speaking',
  'to be honest, i',
];

// ── Unsafe / profanity patterns ───────────────────────────────────────────

const UNSAFE_PATTERNS = [
  /\b(fuck|shit|asshole|bitch|bastard)\b/i,
  /\b(kill yourself|kys)\b/i,
];

// ── Minimum source count (for news-enriched content) ─────────────────────

const MIN_SOURCES_FOR_NEWS_CONTENT = 1;

// ── Main validator ────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {string|object} opts.output  - The AI output (string or parsed object)
 * @param {string}        opts.task    - Task name (e.g. 'daily-briefing')
 * @param {number}        [opts.sourceCount] - How many DB/news sources were injected
 * @param {string[]}      [opts.existingTitles] - For duplicate detection
 * @param {number}        [opts.baseConfidence] - Provider-supplied confidence (0-1)
 */
function validate({ output, task, sourceCount = 0, existingTitles = [], baseConfidence }) {
  const issues = [];
  let confidence = baseConfidence ?? 0.8;

  const text = typeof output === 'string' ? output : JSON.stringify(output);

  // 1. Hallucination risk
  const hallucinationHits = HALLUCINATION_PHRASES.filter((p) =>
    text.toLowerCase().includes(p)
  );
  if (hallucinationHits.length > 0) {
    issues.push(`Hallucination risk: phrases detected — ${hallucinationHits.join(', ')}`);
    confidence -= 0.15 * hallucinationHits.length;
  }

  // 2. Unsafe content
  for (const re of UNSAFE_PATTERNS) {
    if (re.test(text)) {
      issues.push('Unsafe content detected');
      confidence = 0;
      break;
    }
  }

  // 3. Minimum length (task-specific)
  const minLength = _minLength(task);
  if (text.length < minLength) {
    issues.push(`Output too short (${text.length} chars, minimum ${minLength})`);
    confidence -= 0.2;
  }

  // 4. Source coverage penalty (content without any grounding)
  const needsSources = ['daily-briefing', 'news-summary', 'company-enrichment', 'interview-questions'];
  if (needsSources.includes(task) && sourceCount < MIN_SOURCES_FOR_NEWS_CONTENT) {
    issues.push('No source documents were retrieved — response may lack grounding');
    confidence -= 0.1;
  }

  // 5. Duplicate detection (title-level)
  if (existingTitles.length && typeof output === 'object' && output.title) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dupScore = existingTitles.reduce((max, t) => {
      const similarity = _jaroWinkler(norm(output.title), norm(t));
      return Math.max(max, similarity);
    }, 0);
    if (dupScore > 0.85) {
      issues.push(`Duplicate detected (similarity ${(dupScore * 100).toFixed(0)}%)`);
      confidence -= 0.3;
    }
  }

  // 6. Invalid JSON structure (for tasks that return JSON)
  const jsonTasks = ['daily-briefing', 'daily-case', 'daily-reflection', 'resume-tip', 'interview-questions'];
  if (jsonTasks.includes(task) && typeof output === 'string') {
    issues.push('Expected JSON output but received plain text');
    confidence -= 0.25;
  }

  confidence = Math.max(0, Math.min(1, confidence));

  const { autoPublish, minimum } = cfg.confidence;
  const pass = confidence >= minimum && issues.filter((i) => i.startsWith('Unsafe')).length === 0;
  const requiresReview = pass && confidence < autoPublish;

  return {
    pass,
    confidence: parseFloat(confidence.toFixed(3)),
    requiresReview,
    issues,
    status: !pass ? 'failed' : requiresReview ? 'pending_review' : 'published',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function _minLength(task) {
  const map = {
    'daily-briefing': 300,
    'daily-case': 400,
    'daily-reflection': 100,
    'resume-tip': 80,
    'news-summary': 50,
    'review-resume': 100,
    'chat': 20,
  };
  return map[task] || 50;
}

// Simple Jaro-Winkler for duplicate detection (no external dep needed)
function _jaroWinkler(s1, s2) {
  if (s1 === s2) return 1;
  const len1 = s1.length, len2 = s2.length;
  if (!len1 || !len2) return 0;
  const matchDist = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0, transpositions = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++; else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

module.exports = { validate };
