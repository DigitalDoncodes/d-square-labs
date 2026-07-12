import api from './axios';

export const listResources = (params) => api.get('/resources', { params });
export const createResource = (data) => api.post('/resources', data);
export const uploadResourceFile = (formData) =>
  api.post('/resources/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);
export const downloadResource = (id) => api.post(`/resources/${id}/download`);
