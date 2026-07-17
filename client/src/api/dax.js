import api from './axios';

export function daxTask(task, payload = {}) {
  return api.post('/dax', { task, ...payload });
}

export function daxChat(message) {
  return api.post('/dax', { task: 'chat', message });
}

export function getDaxMemory() {
  return api.get('/dax/memory');
}

export function updateDaxMemory(patch) {
  return api.patch('/dax/memory', patch);
}

export function forgetDaxMemory() {
  return api.delete('/dax/memory');
}

export function getChatHistory() {
  return api.get('/dax/chat/history');
}

export function clearChat() {
  return api.delete('/dax/chat');
}

// ── New AI Features ─────────────────────────────────────────────

export function flashcardGenerate(topic, count = 10) {
  return api.post('/dax', { task: 'flashcard-generate', topic, count });
}

export function quizGenerate(topic, count = 5, difficulty = 'medium') {
  return api.post('/dax', { task: 'quiz-generate', topic, count, difficulty });
}

export function financeAssist(question) {
  return api.post('/dax', { task: 'finance-assist', question });
}

export function dashboardInsights() {
  return api.post('/dax', { task: 'dashboard-insights' });
}

export function companyResearch(companyName, sector) {
  return api.post('/dax', { task: 'company-research', companyName, sector });
}

export function resumeAts(targetRole) {
  return api.post('/dax', { task: 'resume-ats', targetRole });
}

// ── Consolidated from api/ai.js + api/aiTools.js (Migration Blueprint Phase 1,
// P1-4) — both were thin wrappers that already called daxTask() under the
// hood. Merging removes the extra files with zero behavior change; every
// function below calls the same endpoint it always did.

export const summariseNote = (noteId) => daxTask('summarise-note', { noteId });
export const generateFramework = (data) => daxTask('case-framework', data);
export const plannerSuggest = () => daxTask('planner-suggest');
export const careerAdvice = (data) => daxTask('career-advice', data);
export const semanticSearch = (data) => daxTask('search', data);
export const reviewResume = () => daxTask('review-resume');

export const summariseDoc = (text) => daxTask('summarise-doc', { text });
export const askCareerAdvice = (question) => daxTask('career-advice', { question });
export const simulateInterview = (payload) => daxTask('interview-simulator', payload);
export const compareCompanies = (slugA, slugB) => daxTask('compare-companies', { slugA, slugB });
