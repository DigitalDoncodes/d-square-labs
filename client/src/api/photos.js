import api from './axios';

export const uploadPhoto = (formData) =>
  api.post('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePhoto = (id) => api.delete(`/photos/${id}`);
export const listRecentPhotos = () => api.get('/photos/recent');
