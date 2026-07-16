const UserMemory = require('../../models/UserMemory');
const User = require('../../models/User');
const UserProfile = require('../../models/UserProfile');
const Resume = require('../../models/Resume');
const Task = require('../../models/Task');
const Note = require('../../models/Note');
const ChatMessage = require('../../models/ChatMessage');
const SiteMeta = require('../../models/SiteMeta');
const { computeDailyCaseStreak } = require('../../utils/streak');

const MAX_RECENT_CONVERSATIONS = 6;
const MAX_RECENT_NOTES = 3;

async function buildContext(userId, options = {}) {
  const {
    includeConversations = false,
    includeCalendar = false,
  } = options;

  const today = new Date().toISOString().slice(0, 10);

  const fetches = [
    User.findById(userId).select('name email tier tierExpiresAt batch program college semester interests bio').lean(),
    UserProfile.findOne({ user: userId }).select('specialization careerInterests college course preMbaDomain learningStyle goals').lean(),
    UserMemory.findOne({ user: userId }).lean(),
    Resume.findOne({ user: userId }).select('personal.fullName summary skills experience education projects achievements certifications').lean(),
    SiteMeta.findOne({ key: 'main' }).select('placementDate batchName').lean(),
  ];

  if (includeConversations) {
    fetches.push(
      ChatMessage.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(MAX_RECENT_CONVERSATIONS)
        .select('role content createdAt')
        .lean()
    );
  } else {
    fetches.push(Promise.resolve([]));
  }

  const [
    user,
    profile,
    userMemory,
    resume,
    siteMeta,
    recentConversations,
  ] = await Promise.all(fetches);

  const pendingTasks = await Task.find({
    $or: [{ createdBy: userId }, { assignee: userId }],
    status: { $ne: 'done' },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .select('title dueDate type status priority')
    .lean();

  const recentNotes = await Note.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(MAX_RECENT_NOTES)
    .select('title subject updatedAt')
    .lean();

  const streak = await computeDailyCaseStreak(userId).catch(() => 0);

  const placementDate = siteMeta?.placementDate
    ? Math.ceil((new Date(siteMeta.placementDate) - new Date()) / 86400000)
    : null;

  const effectiveTier = (() => {
    if (!user) return 'free';
    if (user.tierExpiresAt && new Date() > new Date(user.tierExpiresAt)) return 'free';
    return user.tier || 'free';
  })();

  const context = {
    user: {
      id: userId,
      name: user?.name || '',
      email: user?.email || '',
      tier: effectiveTier,
      batch: user?.batch || siteMeta?.batchName || '',
      college: user?.college || profile?.college || '',
      semester: user?.semester || '',
      program: user?.program || profile?.course || '',
      interests: user?.interests || [],
      bio: user?.bio || '',
    },
    career: {
      specialization: profile?.specialization || userMemory?.specialization || null,
      careerInterests: profile?.careerInterests || userMemory?.careerInterests || [],
      targetCompanies: userMemory?.targetCompanies || [],
      targetRoles: userMemory?.targetRoles || [],
      readinessScore: userMemory?.readinessScore ?? null,
      learningStyle: profile?.learningStyle || 'concise',
      goals: profile?.goals || [],
    },
    resume: resume ? {
      hasResume: true,
      fullName: resume.personal?.fullName || '',
      summary: resume.summary || '',
      skills: resume.skills || [],
      experienceCount: resume.experience?.length || 0,
      educationCount: resume.education?.length || 0,
      projectCount: resume.projects?.length || 0,
      achievementCount: resume.achievements?.length || 0,
      completionPct: userMemory?.resumeCompletionPct || 0,
    } : { hasResume: false },
    memory: userMemory ? {
      recentTopics: userMemory.recentTopics || [],
      strengths: userMemory.strengths || [],
      weaknesses: userMemory.weaknesses || [],
      preferredExplanationStyle: userMemory.preferredExplanationStyle || 'concise',
      contextSummary: userMemory.contextSummary || '',
      notesCount: userMemory.notesCount || 0,
      tasksCompletedCount: userMemory.tasksCompletedCount || 0,
      savedCompanies: userMemory.savedCompanies || [],
    } : null,
    planner: {
      pendingTasks: pendingTasks.map((t) => ({
        title: t.title,
        dueDate: t.dueDate,
        type: t.type,
        status: t.status,
        priority: t.priority,
      })),
      streak,
    },
    study: {
      recentNotes: recentNotes.map((n) => ({
        title: n.title,
        subject: n.subject,
        updatedAt: n.updatedAt,
      })),
    },
    placement: {
      daysToPlacement: placementDate,
      batchName: siteMeta?.batchName || '',
    },
    system: {
      today,
      recentConversations: recentConversations
        ? recentConversations.map((m) => ({
            role: m.role,
            content: m.content.slice(0, 200),
          }))
        : [],
    },
  };

  context.summary = buildSummary(context);
  return context;
}

function buildSummary(ctx) {
  const parts = [];
  if (ctx.user.name) parts.push(`Student: ${ctx.user.name}`);
  if (ctx.user.batch) parts.push(`Batch: ${ctx.user.batch}`);
  if (ctx.career.specialization) parts.push(`Specialization: ${ctx.career.specialization}`);
  if (ctx.placement.daysToPlacement !== null) parts.push(`Days to placement: ${ctx.placement.daysToPlacement}`);
  if (ctx.resume.hasResume) parts.push(`Resume: ${ctx.resume.skills.length} skills, ${ctx.resume.experienceCount} experiences`);
  if (ctx.planner.streak > 0) parts.push(`Case streak: ${ctx.planner.streak} days`);
  if (ctx.planner.pendingTasks.length) parts.push(`Pending tasks: ${ctx.planner.pendingTasks.length}`);
  if (ctx.memory?.recentTopics?.length) parts.push(`Recent topics: ${ctx.memory.recentTopics.slice(-3).join(', ')}`);
  if (ctx.memory?.strengths?.length) parts.push(`Strengths: ${ctx.memory.strengths.join(', ')}`);
  if (ctx.memory?.weaknesses?.length) parts.push(`Areas to improve: ${ctx.memory.weaknesses.join(', ')}`);
  return parts;
}

function formatContextAsText(ctx) {
  if (!ctx) return '';
  return `[Student Context]\n${ctx.summary.join('\n')}\n`;
}

module.exports = { buildContext, formatContextAsText };
