import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3334/admin';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('shootix_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling 401/403 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Don't redirect if we're already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('shootix_admin_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
