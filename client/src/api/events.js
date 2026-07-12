import api from './axios';

export const listEvents = (params) => api.get('/events', { params });
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const rsvpEvent = (id, status) => api.post(`/events/${id}/rsvp`, { status });
export const getMyRSVPs = () => api.get('/events/my-rsvps');
export const getEventAttendees = (id) => api.get(`/events/${id}/attendees`);
