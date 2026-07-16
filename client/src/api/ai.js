import api from './axios';

export const summariseNote     = (noteId) => api.post(`/ai/summarise/${noteId}`);
export const reviewResume      = ()       => api.post('/ai/review-resume');
export const generateFramework = (data)   => api.post('/ai/case-framework', data);
export const plannerSuggest    = ()       => api.post('/ai/planner-suggest');
export const careerAdvice      = (data)   => api.post('/ai/career-advice', data);
export const semanticSearch    = (data)   => api.post('/ai/search', data);

// Dax Memory — what Dax carries about you between sessions.
export const getDaxMemory    = ()       => api.get('/ai/memory');
export const updateDaxMemory = (patch)  => api.patch('/ai/memory', patch);
export const forgetDaxMemory = ()       => api.delete('/ai/memory');
