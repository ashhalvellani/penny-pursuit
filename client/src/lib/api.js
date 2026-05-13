import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5050');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);
