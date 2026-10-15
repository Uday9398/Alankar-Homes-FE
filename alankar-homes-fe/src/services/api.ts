import axios from 'axios';
import { removeLocalUser } from './tokenService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  // Sends the httpOnly auth cookie with every request
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeLocalUser();
      // Avoid redirect loops if on auth screens
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message || error);
  }
);

export default api;
