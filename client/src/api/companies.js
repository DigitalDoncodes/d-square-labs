import api from './axios';

export const listCompanies = (params) => api.get('/companies', { params });
export const getCompany = (slug) => api.get(`/companies/${slug}`);

// Admin
export const createCompany = (data) => api.post('/companies', data);
export const updateCompany = (id, data) => api.put(`/companies/${id}`, data);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);
