import api from './axios';

export const getMySubscription     = ()       => api.get('/subscription/me');
export const getSubscriptionStatus = ()       => api.get('/subscription/me');
export const submitPaymentRef   = (data)      => api.post('/subscription/request', data);
export const activateTrial      = ()          => api.post('/subscription/trial');
