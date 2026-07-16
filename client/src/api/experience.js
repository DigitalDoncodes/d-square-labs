import api from './axios';

export const getDailyMission = () => api.get('/recommendations/daily-mission');

export const getRecommendations = () => api.get('/recommendations');

export const getRecommendationStream = () => api.get('/recommendations/stream');

export const getReadiness = () => api.get('/readiness');

export const transitionLifecycle = (id, toState) =>
  api.post(`/recommendations/${id}/lifecycle`, { toState });

export const recordFeedback = (id, type) =>
  api.post(`/recommendations/${id}/feedback`, { type });

export const getWeeklyReview = () => api.get('/recommendations/weekly-review');

export const generateWeeklyReview = () => api.post('/recommendations/weekly-review/generate');

export const getGoalProgress = () => api.get('/recommendations/goal-progress');

export const markSeen = (ids) =>
  api.post('/recommendations/lifecycle/mark-seen', { ids });
