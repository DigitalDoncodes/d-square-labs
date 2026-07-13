import api from './axios';

export const getTodayReflection = () => api.get('/reflection/today');
