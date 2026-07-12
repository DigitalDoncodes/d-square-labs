/**
 * Robust JSON parser for AI responses.
 * Handles: code fences, partial JSON, trailing commas, extra text.
 */

function stripFences(raw) {
  return raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();
}

function extractJSON(raw) {
  // Try direct parse first
  try { return JSON.parse(raw); } catch (_) {}

  // Strip fences and retry
  const stripped = stripFences(raw);
  try { return JSON.parse(stripped); } catch (_) {}

  // Find first { or [ and last matching } or ]
  const firstBrace = Math.min(
    stripped.indexOf('{') === -1 ? Infinity : stripped.indexOf('{'),
    stripped.indexOf('[') === -1 ? Infinity : stripped.indexOf('['),
  );
  if (firstBrace === Infinity) throw new Error('No JSON object found in response');

  const opener = stripped[firstBrace];
  const closer = opener === '{' ? '}' : ']';
  const lastClose = stripped.lastIndexOf(closer);
  if (lastClose === -1) throw new Error('Unclosed JSON in response');

  const candidate = stripped.slice(firstBrace, lastClose + 1);
  try { return JSON.parse(candidate); } catch (_) {}

  // Last resort: remove trailing commas (common LLM mistake)
  const cleaned = candidate.replace(/,\s*([\]}])/g, '$1');
  return JSON.parse(cleaned);
}

/**
 * Parse AI text response into a JS object.
 * Throws with a descriptive error if parsing fails.
 */
function parseJSON(text, context = '') {
  try {
    return extractJSON(text);
  } catch (err) {
    throw new Error(`JSON parse failed${context ? ` (${context})` : ''}: ${err.message}\nRaw: ${text.slice(0, 200)}`);
  }
}

module.exports = { parseJSON, stripFences };
