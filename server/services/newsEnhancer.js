// AI news enhancement: turns each cached article into MBA prep material —
// why it matters, the frameworks it maps to, and how an interviewer would ask
// about it. Fills the reserved fields on NewsItem via the Claude API.
// Gracefully disabled until ANTHROPIC_API_KEY is set (same pattern as mailer).
const Anthropic = require('@anthropic-ai/sdk');
const NewsItem = require('../models/NewsItem');

const enabled = () => Boolean(process.env.ANTHROPIC_API_KEY);
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const BATCH_SIZE = 8; // articles per API call — one call enhances the whole batch

let client = null;
const getClient = () => {
  if (!client) client = new Anthropic();
  return client;
};

// Structured output schema: one enhancement object per article, keyed by id.
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    enhancements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The article id exactly as given' },
          whyItMatters: {
            type: 'string',
            description: '2-3 sentences: why an Indian MBA student should care, tied to placements or business fundamentals',
          },
          mbaConcepts: {
            type: 'array',
            items: { type: 'string' },
            description: '2-4 frameworks/concepts this story illustrates (e.g. "Porter\'s Five Forces", "Working capital cycle")',
          },
          interviewQuestions: {
            type: 'array',
            items: { type: 'string' },
            description: '2 questions an interviewer could realistically ask based on this story',
          },
          keyTakeaways: {
            type: 'array',
            items: { type: 'string' },
            description: '2-3 crisp one-line takeaways',
          },
        },
        required: ['id', 'whyItMatters', 'mbaConcepts', 'interviewQuestions', 'keyTakeaways'],
        additionalProperties: false,
      },
    },
  },
  required: ['enhancements'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are the MBA-prep layer of DATAD, a platform for Indian MBA students preparing for campus placements (IT services, banking, FMCG, consulting recruiters). For each business news article, produce placement-ready framing: why it matters, which MBA concepts it maps to, realistic interview questions, and key takeaways. Be concrete and India-context aware. Never invent facts beyond the article; if the summary is thin, reason from the headline conservatively.`;

async function enhanceBatch(articles) {
  const payload = articles.map((a) => ({
    id: a._id.toString(),
    title: a.title,
    summary: a.summary || '',
    category: a.category,
    source: a.source,
  }));

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: `Enhance these ${payload.length} articles:\n\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    console.error('News enhancement refused by safety classifier — skipping batch');
    return 0;
  }

  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) return 0;
  const { enhancements } = JSON.parse(text);

  let saved = 0;
  for (const e of enhancements || []) {
    const result = await NewsItem.updateOne(
      { _id: e.id },
      {
        $set: {
          whyItMatters: e.whyItMatters,
          mbaConcepts: (e.mbaConcepts || []).slice(0, 4),
          interviewQuestions: (e.interviewQuestions || []).slice(0, 3),
          keyTakeaways: (e.keyTakeaways || []).slice(0, 3),
        },
      }
    );
    if (result.modifiedCount) saved += 1;
  }
  return saved;
}

// Enhance the newest articles that don't have AI framing yet.
// Called after each news refresh; safe to call repeatedly.
async function enhancePending(maxArticles = 24) {
  if (!enabled()) return { enhanced: 0, skipped: 'ANTHROPIC_API_KEY not set' };

  const pending = await NewsItem.find({
    $or: [{ whyItMatters: null }, { whyItMatters: '' }, { whyItMatters: { $exists: false } }],
  })
    .sort({ publishedAt: -1 })
    .limit(maxArticles)
    .lean();

  if (pending.length === 0) return { enhanced: 0 };

  let enhanced = 0;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    try {
      enhanced += await enhanceBatch(batch);
    } catch (err) {
      // One failed batch shouldn't kill the run; the articles stay pending.
      console.error('News enhancement batch failed:', err.message);
    }
  }
  console.log(`News enhancement: ${enhanced}/${pending.length} articles enriched`);
  return { enhanced };
}

module.exports = { enhancePending, enhancerEnabled: enabled };
