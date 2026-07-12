import api from './axios';

export const getFeed = (params) => api.get('/feed', { params });
export const createPost = (data) => api.post('/feed', data);
export const reactToPost = (id, emoji) => api.post(`/feed/${id}/react`, { emoji });
export const votePoll = (id, optionIdx) => api.post(`/feed/${id}/vote/${optionIdx}`);
