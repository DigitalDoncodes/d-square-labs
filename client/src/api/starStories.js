import api from './axios';
export const listStories   = ()       => api.get('/star-stories');
export const createStory   = (data)   => api.post('/star-stories', data);
export const updateStory   = (id, d)  => api.put(`/star-stories/${id}`, d);
export const deleteStory   = (id)     => api.delete(`/star-stories/${id}`);
