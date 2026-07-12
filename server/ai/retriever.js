/**
 * RAG Retriever — Phase 1
 * Fetches relevant project data from MongoDB before AI generation.
 * Every AI request should call the appropriate retriever so the model
 * works from ground truth rather than hallucinated knowledge.
 */

const Resume     = require('../models/Resume');
const Task       = require('../models/Task');
const Company    = require('../models/Company');
const Note       = require('../models/Note');
const NewsItem   = require('../models/NewsItem');
const ResumeTip  = require('../models/ResumeTip');
const DailyCase  = require('../models/DailyCase');
const Post       = require('../models/Post');

// ── Resume context ─────────────────────────────────────────────────────────

async function getResumeContext(userId) {
  const resume = await Resume.findOne({ user: userId }).lean();
  if (!resume) return null;

  const skills = (resume.skills || []).join(', ');
  const experience = (resume.experience || [])
    .map((e) => `${e.role} at ${e.organization} (${e.duration})`)
    .join('; ');
  const education = (resume.education || [])
    .map((e) => `${e.degree} at ${e.institution}`)
    .join('; ');
  const summary = resume.summary || '';

  return {
    raw: resume,
    text: `Resume summary: ${summary}\nSkills: ${skills}\nExperience: ${experience}\nEducation: ${education}`,
  };
}

// ── Planner / Tasks context ────────────────────────────────────────────────

async function getTaskContext(userId) {
  const tasks = await Task.find({
    $or: [{ createdBy: userId }, { assignee: userId }],
    status: { $ne: 'done' },
  })
    .sort({ dueDate: 1 })
    .limit(20)
    .lean();

  if (!tasks.length) return null;

  const lines = tasks.map((t) => {
    const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : 'no date';
    return `- [${t.status}] ${t.title} (due ${due}, type: ${t.type})`;
  });

  return {
    raw: tasks,
    text: `Pending tasks (${tasks.length}):\n${lines.join('\n')}`,
  };
}

// ── Company context ────────────────────────────────────────────────────────

async function getCompanyContext(companyId) {
  const company = await Company.findById(companyId)
    .select('name sector overview businessModel whatTheyLookFor prepTips interviewQuestions roles rounds')
    .lean();
  if (!company) return null;

  const tips = (company.prepTips || []).join('\n');
  const questions = (company.interviewQuestions || [])
    .slice(0, 5)
    .map((q) => `[${q.category}] ${q.question}`)
    .join('\n');

  return {
    raw: company,
    text: `Company: ${company.name} (${company.sector})\nOverview: ${company.overview || ''}\nWhat they look for: ${company.whatTheyLookFor || ''}\nPrep tips:\n${tips}\nSample questions:\n${questions}`,
  };
}

// ── Notes context ──────────────────────────────────────────────────────────

async function getRecentNotes(userId, limit = 5) {
  const notes = await Note.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('title subject content updatedAt')
    .lean();

  if (!notes.length) return null;

  const lines = notes.map((n) => `[${n.subject || 'General'}] ${n.title}: ${(n.content || '').slice(0, 120)}…`);
  return {
    raw: notes,
    text: `Recent notes:\n${lines.join('\n')}`,
  };
}

// ── Recent news context ────────────────────────────────────────────────────

async function getRecentNews(categories, limit = 10) {
  const filter = categories?.length ? { category: { $in: categories } } : {};
  const news = await NewsItem.find(filter)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title summary category publishedAt')
    .lean();

  if (!news.length) return null;

  const lines = news.map((n) => `[${n.category}] ${n.title}: ${(n.summary || '').slice(0, 100)}`);
  return {
    raw: news,
    text: `Recent news:\n${lines.join('\n')}`,
  };
}

// ── Recent resume tips (for deduplication) ────────────────────────────────

async function getRecentResumeTips(limit = 10) {
  const tips = await ResumeTip.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('category title tip')
    .lean();

  if (!tips.length) return '';
  return tips.map((t) => `[${t.category}] ${t.title}`).join('\n');
}

// ── Discussion / Posts context ─────────────────────────────────────────────

async function getSimilarPosts(title, limit = 5) {
  // Keyword-based similarity until vector search is warm
  const words = (title || '').split(/\s+/).filter((w) => w.length > 4).slice(0, 5);
  if (!words.length) return null;

  const regex = new RegExp(words.join('|'), 'i');
  const posts = await Post.find({ title: { $regex: regex } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title body aiResponse')
    .lean();

  if (!posts.length) return null;

  const lines = posts.map((p) => `- ${p.title}: ${(p.body || '').slice(0, 80)}`);
  return {
    raw: posts,
    text: `Similar existing posts:\n${lines.join('\n')}`,
  };
}

// ── Recent daily cases (for deduplication) ────────────────────────────────

async function getRecentCases(limit = 7) {
  const cases = await DailyCase.find()
    .sort({ dateKey: -1 })
    .limit(limit)
    .select('title category')
    .lean();

  return cases.map((c) => `[${c.category}] ${c.title}`).join('\n');
}

// ── Composite context builders ─────────────────────────────────────────────

async function buildResumeRAGContext(userId) {
  const [resumeCtx, taskCtx] = await Promise.all([
    getResumeContext(userId),
    getTaskContext(userId),
  ]);

  const parts = [];
  if (resumeCtx) parts.push(resumeCtx.text);
  if (taskCtx) parts.push(taskCtx.text);

  return {
    contextText: parts.join('\n\n'),
    sources: {
      resume: Boolean(resumeCtx),
      tasks: Boolean(taskCtx),
    },
  };
}

async function buildPlannerRAGContext(userId) {
  const [taskCtx, noteCtx] = await Promise.all([
    getTaskContext(userId),
    getRecentNotes(userId, 3),
  ]);

  const parts = [];
  if (taskCtx) parts.push(taskCtx.text);
  if (noteCtx) parts.push(noteCtx.text);

  return {
    contextText: parts.join('\n\n'),
    sources: { tasks: Boolean(taskCtx), notes: Boolean(noteCtx) },
  };
}

async function buildCareerHubRAGContext(userId, companyId) {
  const [resumeCtx, companyCtx] = await Promise.all([
    getResumeContext(userId),
    companyId ? getCompanyContext(companyId) : Promise.resolve(null),
  ]);

  const parts = [];
  if (resumeCtx) parts.push(resumeCtx.text);
  if (companyCtx) parts.push(companyCtx.text);

  return {
    contextText: parts.join('\n\n'),
    sources: { resume: Boolean(resumeCtx), company: Boolean(companyCtx) },
  };
}

module.exports = {
  getResumeContext,
  getTaskContext,
  getCompanyContext,
  getRecentNotes,
  getRecentNews,
  getRecentResumeTips,
  getSimilarPosts,
  getRecentCases,
  buildResumeRAGContext,
  buildPlannerRAGContext,
  buildCareerHubRAGContext,
};
