import api from './axios';

export const listDrives = (params) => api.get('/placements', { params });
export const createDrive = (data) => api.post('/placements', data);
export const updateDrive = (id, data) => api.put(`/placements/${id}`, data);
export const deleteDrive = (id) => api.delete(`/placements/${id}`);
export const applyToDrive = (id, data) => api.post(`/placements/${id}/apply`, data);
export const listMyApplications = () => api.get('/placements/my-applications');
export const updateMyApplication = (appId, data) => api.put(`/placements/my-applications/${appId}`, data);
