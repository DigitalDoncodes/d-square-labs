import api from './axios';

export const getTodayCase = () => api.get('/daily-case/today');
export const solveCase = (id) => api.post(`/daily-case/${id}/solve`);

// Admin
export const listCases = () => api.get('/daily-case');
export const createCase = (data) => api.post('/daily-case', data);
export const updateCase = (id, data) => api.put(`/daily-case/${id}`, data);
export const deleteCase = (id) => api.delete(`/daily-case/${id}`);
