import api from './axios';

export const listPosts   = (params) => api.get('/posts', { params });
export const getPost     = (id)     => api.get(`/posts/${id}`);
export const createPost  = (data)   => api.post('/posts', data);
export const updatePost  = (id, d)  => api.put(`/posts/${id}`, d);
export const deletePost  = (id)     => api.delete(`/posts/${id}`);
export const likePost    = (id)     => api.post(`/posts/${id}/like`);

export const createReply = (postId, body) => api.post(`/posts/${postId}/replies`, { body });
export const deleteReply = (postId, replyId) => api.delete(`/posts/${postId}/replies/${replyId}`);
export const likeReply   = (postId, replyId) => api.post(`/posts/${postId}/replies/${replyId}/like`);
