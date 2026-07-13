import axios from 'axios';

let authToken = '';

export const setAuthToken  = (token: string) => { authToken = token; };
export const clearAuthToken = () => { authToken = ''; };

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

export default api;
