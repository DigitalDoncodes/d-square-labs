const Note = require('../../../models/Note');

async function collect(userId) {
  try {
    const notes = await Note.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .catch(() => []);

    if (!notes.length) {
      return { total: 0, recentSubjects: [], recentTopics: [] };
    }

    const subjects = {};
    for (const n of notes) {
      const subj = n.subject || n.customSubject || 'general';
      subjects[subj] = (subjects[subj] || 0) + 1;
    }

    const subjectList = Object.entries(subjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s]) => s);

    return {
      total: notes.length,
      recentSubjects: subjectList,
      recentTitles: notes.slice(0, 5).map((n) => n.title),
      recentTopics: notes.slice(0, 5).map((n) => n.subject || n.customSubject || 'general').filter(Boolean),
    };
  } catch {
    return null;
  }
}

module.exports = { collect };
