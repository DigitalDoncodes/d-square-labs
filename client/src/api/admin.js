import api from './axios';

export const getStats = () => api.get('/admin/stats');
export const listStudents = () => api.get('/admin/students');

export const listJournal = () => api.get('/admin/journal');
export const createJournalEntry = (data) => api.post('/admin/journal', data);
export const updateJournalEntry = (id, data) => api.put(`/admin/journal/${id}`, data);
export const deleteJournalEntry = (id) => api.delete(`/admin/journal/${id}`);

export const createAnnouncement = (data) => api.post('/admin/announcements', data);
export const deleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`);
export const listAnnouncements = () => api.get('/announcements');
