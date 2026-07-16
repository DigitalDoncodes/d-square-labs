import axios from 'axios';

// Default to a relative /api base: in dev Vite proxies it to the server,
// and in production (or through an ngrok tunnel) the API is same-origin.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const program = localStorage.getItem('activeProgram');
  if (program && program !== 'mba') config.headers['x-program'] = program;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
