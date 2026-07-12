import api from './axios';

export const listListings = (params) => api.get('/marketplace', { params });
export const createListing = (data) => api.post('/marketplace', data);
export const updateListing = (id, data) => api.put(`/marketplace/${id}`, data);
export const deleteListing = (id) => api.delete(`/marketplace/${id}`);
export const markSold = (id) => api.put(`/marketplace/${id}/sold`);
