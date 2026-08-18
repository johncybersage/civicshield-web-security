import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Ensure the base URL ends with /api, but avoid duplicating it if it already exists
const baseURL = configuredUrl.endsWith('/api')
  ? configuredUrl
  : `${configuredUrl}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
