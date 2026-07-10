import api from './axios';

// Reads
export const listItems = (params = {}) => api.get('/entertainment/items', { params });
export const getItem = (slug) => api.get(`/entertainment/items/${slug}`);

// Likes & bookmarks
export const toggleLike = (id) => api.post(`/entertainment/items/${id}/like`);
export const toggleBookmark = (id) => api.post(`/entertainment/items/${id}/bookmark`);

// Community memories
export const addMemory = (id, data) => api.post(`/entertainment/items/${id}/memories`, data);

// Admin content management
export const createItem = (data) => api.post('/entertainment/items', data);
export const updateItem = (id, data) => api.put(`/entertainment/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/entertainment/items/${id}`);
