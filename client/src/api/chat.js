import api from './axios';

export const sendMessage  = (message) => api.post('/chat', { message });
export const getChatHistory = ()        => api.get('/chat/history');
export const clearChat    = ()          => api.delete('/chat');
