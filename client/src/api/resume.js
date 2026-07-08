import api from './axios';

export const getMyResume = () => api.get('/resume');
export const saveResume = (data) => api.put('/resume', data);
