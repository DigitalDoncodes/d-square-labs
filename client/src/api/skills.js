import api from './axios';

export const listSkills = (params) => api.get('/skills', { params });
export const createSkill = (data) => api.post('/skills', data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);
export const rateSkill = (id, data) => api.post(`/skills/${id}/rate`, data);
