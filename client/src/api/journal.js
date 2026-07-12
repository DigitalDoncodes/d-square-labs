import api from './axios';

export const listJournal        = ()          => api.get('/journal');
export const createJournalEntry = (data)      => api.post('/journal', data);
export const updateJournalEntry = (id, data)  => api.put(`/journal/${id}`, data);
export const deleteJournalEntry = (id)        => api.delete(`/journal/${id}`);
