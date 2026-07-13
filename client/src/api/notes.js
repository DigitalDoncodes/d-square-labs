import api from './axios';

export const listNotes = (params) => api.get('/notes', { params });
export const getNote = (id) => api.get(`/notes/${id}`);
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const uploadNoteAttachment = (formData) =>
  api.post('/notes/upload-attachment', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
