import api from './axios';

export const getMeta = () => api.get('/meta');

// Admin
export const updateMeta = (data) => api.put('/admin/meta', data);
