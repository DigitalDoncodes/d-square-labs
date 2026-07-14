import api from './axios';
export const getPivot      = ()        => api.get('/pivot');
export const upsertPivot   = (data)    => api.put('/pivot', data);
export const updateGap     = (gapId, status) => api.patch(`/pivot/gaps/${gapId}`, { status });
