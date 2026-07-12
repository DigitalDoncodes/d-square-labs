import api from './axios';

export const getDirectory = (params) => api.get('/directory', { params });
export const getMyProfile = () => api.get('/directory/me');
export const upsertMyProfile = (data) => api.put('/directory/me', data);
