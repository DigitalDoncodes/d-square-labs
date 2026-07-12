import api from './axios';

export const getTodayLog = () => api.get('/study-tools/today');
export const updateLog = (data) => api.put('/study-tools/today', data);
export const getStreak = () => api.get('/study-tools/streak');
export const getWeekStats = () => api.get('/study-tools/week-stats');
