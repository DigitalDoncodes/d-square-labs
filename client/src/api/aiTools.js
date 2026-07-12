import api from './axios';

export const summariseDoc = (text) => api.post('/ai/summarise', { text });
export const reviewResume = () => api.post('/ai/review-resume');
export const askCareerAdvice = (question) => api.post('/ai/career-advice', { question });
export const semanticSearch = (query) => api.post('/ai/search', { query });
export const simulateInterview = (payload) => api.post('/ai/interview-simulator', payload);
export const compareCompanies = (slugA, slugB) => api.post('/ai/compare-companies', { slugA, slugB });
