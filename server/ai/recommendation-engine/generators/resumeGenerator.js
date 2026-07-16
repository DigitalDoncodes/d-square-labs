const { createRecommendation } = require('../recommendationFactory');

function generate(profile) {
  if (!profile?.career) return [];

  const career = profile.career;
  const scores = profile.scores;

  const suggestions = [];

  // No resume
  if (!career.hasResume) {
    suggestions.push(createRecommendation({
      type: 'resume-suggestion',
      title: 'Create Your Resume',
      description: 'You haven\'t uploaded a resume yet. This is the single most important document for placement season.',
      reason: 'No resume detected. Without a resume, applications cannot be submitted and readiness remains low.',
      confidence: 95,
      urgency: scores?.careerReadiness != null && scores.careerReadiness < 50 ? 90 : 70,
      expectedImpact: 'Enables placement applications and AI-powered review.',
      estimatedCompletionTime: '30–45 min',
      sourceSignals: ['no-resume', 'career-collector'],
      actions: [{ label: 'Create Resume', route: '/resume' }],
    }));
    return suggestions;
  }

  // Incomplete resume
  const pct = career.resumeCompletionPct || 0;
  if (pct < 100) {
    if (!career.summary) {
      suggestions.push(createRecommendation({
        type: 'resume-suggestion',
        title: 'Add a Professional Summary',
        description: 'Your resume is missing a summary section. A strong summary helps recruiters quickly understand your profile.',
        reason: 'Resume summary is empty. Summaries increase recruiter engagement and are weighted in AI screening.',
        confidence: 80,
        urgency: scores?.careerReadiness != null && scores.careerReadiness < 60 ? 60 : 40,
        expectedImpact: 'Increases recruiter engagement and screening pass rate.',
        estimatedCompletionTime: '10 min',
        sourceSignals: ['missing-summary', `resume-completion-${pct}`],
        actions: [{ label: 'Edit Resume', route: '/resume' }],
      }));
    }

    if (!career.experience?.length && career.experienceYears > 0) {
      suggestions.push(createRecommendation({
        type: 'resume-suggestion',
        title: 'Add Work Experience',
        description: `You have ${career.experienceYears} year${career.experienceYears > 1 ? 's' : ''} of experience but no experience section on your resume.`,
        reason: `Experience gap detected: ${career.experienceYears} years indicated but no entries in resume experience section.`,
        confidence: 85,
        urgency: 55,
        expectedImpact: 'Showcases relevant experience to recruiters.',
        estimatedCompletionTime: '20–30 min',
        sourceSignals: [`experience-years-${career.experienceYears}`, 'missing-experience-section'],
        actions: [{ label: 'Add Experience', route: '/resume' }],
      }));
    }

    if ((career.skillCount || 0) < 5) {
      suggestions.push(createRecommendation({
        type: 'resume-suggestion',
        title: 'Expand Your Skills Section',
        description: `Your resume lists only ${career.skillCount || 0} skill${(career.skillCount || 0) === 1 ? '' : 's'}. Adding 8–15 relevant skills improves ATS matching.`,
        reason: `Only ${career.skillCount || 0} skill${(career.skillCount || 0) === 1 ? '' : 's'} listed. Most ATS filters expect 8–15 skills for MBA roles.`,
        confidence: 75,
        urgency: 45,
        expectedImpact: 'Improves ATS screening pass rate.',
        estimatedCompletionTime: '10 min',
        sourceSignals: [`skill-count-${career.skillCount || 0}`],
        actions: [{ label: 'Edit Skills', route: '/resume' }],
      }));
    }
  }

  // STAR stories
  if ((career.starStoriesCount || 0) < 3) {
    suggestions.push(createRecommendation({
      type: 'resume-suggestion',
      title: 'Prepare STAR Stories for Interviews',
      description: `You have ${career.starStoriesCount || 0} STAR ${(career.starStoriesCount || 0) === 1 ? 'story' : 'stories'}. Most interviews require 3–5 well-prepared stories for competency questions.`,
      reason: `${career.starStoriesCount || 0} STAR ${(career.starStoriesCount || 0) === 1 ? 'story' : 'stories'} prepared. Interview streams require 3–5 stories covering leadership, teamwork, problem-solving, conflict, and failure.`,
      confidence: 80,
      urgency: (career.interviewCount || 0) > 0 ? 85 : 50,
      expectedImpact: 'Essential for competency-based interview questions.',
      estimatedCompletionTime: '15–20 min per story',
      sourceSignals: [`star-stories-${career.starStoriesCount || 0}`, career.interviewCount > 0 ? `active-interviews-${career.interviewCount}` : ''].filter(Boolean),
      actions: [{ label: 'Write STAR Stories', route: '/star-stories' }],
    }));
  }

  return suggestions;
}

module.exports = { generate };
