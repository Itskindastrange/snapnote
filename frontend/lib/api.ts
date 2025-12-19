import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to unauthorized access (401)
    if (error.response?.status === 401) {
      // Clear local storage if token invalid/expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('snapnote_current_user');
        // We might want to trigger a redirect here or let the AuthContext handle it
        // window.location.href = '/auth'; 
      }
    }
    return Promise.reject(error);
  }
);