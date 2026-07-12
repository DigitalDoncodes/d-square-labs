import api from './axios';

export const listProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const getProject = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addMember = (id, data) => api.post(`/projects/${id}/members`, data);
export const removeMember = (id, userId) => api.delete(`/projects/${id}/members/${userId}`);
export const listProjectTasks = (id) => api.get(`/projects/${id}/tasks`);
export const createProjectTask = (id, data) => api.post(`/projects/${id}/tasks`, data);
export const updateProjectTask = (id, taskId, data) => api.put(`/projects/${id}/tasks/${taskId}`, data);
export const deleteProjectTask = (id, taskId) => api.delete(`/projects/${id}/tasks/${taskId}`);
