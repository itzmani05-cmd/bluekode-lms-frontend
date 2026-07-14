import axios from 'axios';

const TOKEN_KEY = 'bluekode_token';

let authToken = localStorage.getItem(TOKEN_KEY) ?? '';

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  authToken = '';
  localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

export default api;
