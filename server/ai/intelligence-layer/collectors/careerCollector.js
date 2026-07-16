const Resume = require('../../../models/Resume');
const PlacementApplication = require('../../../models/PlacementApplication');
const CompanyRead = require('../../../models/CompanyRead');
const StarStory = require('../../../models/StarStory');

async function collect(userId) {
  try {
    const [resume, applications, companiesRead, starStories] = await Promise.all([
      Resume.findOne({ user: userId }).lean().catch(() => null),
      PlacementApplication.find({ user: userId }).lean().catch(() => []),
      CompanyRead.countDocuments({ user: userId }).catch(() => 0),
      StarStory.find({ user: userId }).lean().catch(() => []),
    ]);

    const appStatus = { applied: 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0 };
    for (const a of applications) {
      if (appStatus[a.status] !== undefined) appStatus[a.status]++;
    }

    const skills = resume?.skills || [];
    const education = resume?.education || [];
    const experience = resume?.experience || [];

    return {
      hasResume: !!resume,
      resumeCompletionPct: resume ? _calcResumeCompletion(resume) : 0,
      skills,
      skillCount: skills.length,
      education,
      educationCount: education.length,
      experience,
      experienceCount: experience.length,
      experienceYears: experience.reduce((sum, e) => sum + _parseYears(e.duration), 0),
      summary: resume?.summary || null,
      applications: applications.length,
      appliedCount: appStatus.applied,
      shortlistedCount: appStatus.shortlisted,
      interviewCount: appStatus.interview,
      offerCount: appStatus.offer,
      rejectedCount: appStatus.rejected,
      companiesResearched: companiesRead,
      starStoriesCount: starStories.length,
      readinessScore: null,
    };
  } catch {
    return null;
  }
}

function _calcResumeCompletion(resume) {
  let score = 0;
  if (resume.personal?.fullName) score += 10;
  if (resume.summary) score += 15;
  if (resume.education?.length) score += 20;
  if (resume.experience?.length) score += 20;
  if (resume.skills?.length) score += 15;
  if (resume.projects?.length) score += 10;
  if (resume.certifications?.length) score += 5;
  if (resume.achievements?.length) score += 5;
  return Math.min(100, score);
}

function _parseYears(duration) {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

module.exports = { collect };
