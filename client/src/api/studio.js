import api from './axios';

export const uploadFiles = (files, onProgress) => {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  return api.post('/studio/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
};

export const listItems = (params) => api.get('/studio/items', { params });
export const getItem = (id) => api.get(`/studio/items/${id}`);
export const updateItem = (id, data) => api.patch(`/studio/items/${id}`, data);
export const publishItem = (id, resolution) =>
  api.post(`/studio/items/${id}/publish`, resolution ? { resolution } : {});
export const draftItem = (id) => api.post(`/studio/items/${id}/draft`);
export const scheduleItem = (id, scheduledFor) =>
  api.post(`/studio/items/${id}/schedule`, { scheduledFor });
export const reanalyzeItem = (id) => api.post(`/studio/items/${id}/reanalyze`);
export const removeItem = (id, reason) =>
  api.delete(`/studio/items/${id}`, { data: reason ? { reason } : {} });
export const listDestinations = () => api.get('/studio/destinations');
