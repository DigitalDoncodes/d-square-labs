import api from './axios';

export const listCompanies = (params) => api.get('/companies', { params });
export const getCompany = (slug) => api.get(`/companies/${slug}`);
export const getQuestionBank = () => api.get('/companies/questions/bank');
export const getCompanyNews = (name) => api.get('/companies/news/feed', { params: { name } });

// Admin
export const createCompany = (data) => api.post('/companies', data);
export const updateCompany = (id, data) => api.put(`/companies/${id}`, data);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);
