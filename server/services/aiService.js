// Central AI service — all Groq calls go through here.
const OpenAI = require('openai');

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

let _client = null;
const client = () => {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _client;
};

const enabled = () => Boolean(process.env.GROQ_API_KEY);

function extractText(response) {
  return response.choices[0].message.content.trim();
}

function stripFences(raw) {
  return raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
}

// ── Note summarizer ──────────────────────────────────────────────────────────
exports.summariseNote = async ({ title, subject, content }) => {
  if (!enabled()) throw new Error('AI not configured');

  const response = await client().chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: 'You are an MBA study assistant. Be concise, precise, and practically useful for an Indian MBA student preparing for placements and exams.',
      },
      {
        role: 'user',
        content: `Summarise the following MBA note in three parts:
1. A 2-3 sentence executive summary.
2. Five bullet-point key takeaways (each ≤ 15 words).
3. Relevant business frameworks or concepts mentioned (comma-separated, max 5).

Note title: ${title}
Subject: ${subject}
Content:
${content}

Reply in this exact JSON format and nothing else:
{"summary":"…","keyPoints":["…","…","…","…","…"],"frameworks":"…"}`,
      },
    ],
  });

  return JSON.parse(stripFences(extractText(response)));
};

// ── Resume reviewer ──────────────────────────────────────────────────────────
exports.reviewResume = async (resume) => {
  if (!enabled()) throw new Error('AI not configured');

  const p = resume.personal || {};
  const lines = [
    `Name: ${p.fullName || '(blank)'}`,
    `Email: ${p.email || '(blank)'}  Phone: ${p.phone || '(blank)'}`,
    `LinkedIn: ${p.linkedin || '(none)'}  Website: ${p.website || '(none)'}`,
    `Summary: ${resume.summary || '(none)'}`,
    `Education: ${(resume.education || []).map((e) => `${e.degree} @ ${e.institution} (${e.years}, ${e.score})`).join('; ') || '(none)'}`,
    `Experience: ${(resume.experience || []).map((e) => `${e.role} @ ${e.organization} (${e.duration})`).join('; ') || '(none)'}`,
    `Projects: ${(resume.projects || []).map((e) => e.title).join(', ') || '(none)'}`,
    `Skills: ${(resume.skills || []).join(', ') || '(none)'}`,
    `Certifications: ${(resume.certifications || []).map((c) => c.name).join(', ') || '(none)'}`,
    `Achievements: ${(resume.achievements || []).join('; ') || '(none)'}`,
  ];

  const response = await client().chat.completions.create({
    model: MODEL,
    max_tokens: 700,
    messages: [
      {
        role: 'system',
        content: 'You are a senior career counsellor at an Indian B-school specialising in placement preparation. Be direct, specific, and actionable. Never generic.',
      },
      {
        role: 'user',
        content: `Review this MBA resume for placement readiness. Give exactly 3 improvements, each tied to a specific gap you can see.

${lines.join('\n')}

Reply in this exact JSON format and nothing else:
{"overallImpression":"one sentence","improvements":[{"area":"…","issue":"specific problem","fix":"concrete action ≤ 20 words"},{"area":"…","issue":"…","fix":"…"},{"area":"…","issue":"…","fix":"…"}]}`,
      },
    ],
  });

  return JSON.parse(stripFences(extractText(response)));
};

// ── Daily case framework generator ──────────────────────────────────────────
exports.generateCaseFramework = async ({ title, category, scenario, question }) => {
  if (!enabled()) throw new Error('AI not configured');

  const response = await client().chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: 'You are an MBA case interview coach. Write clear, structured frameworks for Indian B-school students.',
      },
      {
        role: 'user',
        content: `Generate a concise suggested framework (3-5 bullet points, ≤ 200 words total) for this daily MBA case.

Category: ${category}
Title: ${title}
Scenario: ${scenario}
Question: ${question}

Reply with plain text only — no JSON, no markdown headers.`,
      },
    ],
  });

  return extractText(response);
};
