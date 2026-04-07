import axios from 'axios';

const api = axios.create({
    baseURL: 'https://photo-invoice-licence-sever.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

/* 
  Request Interceptor:
  Injects the admin token if present in localStorage.
  All admin routes in the backend expect 'x-admin-token' header.
*/
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('shootix_admin_token');
    if (token) {
        config.headers['x-admin-token'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/* 
  Response Interceptor:
  Provides a centralized way to handle 401/403 errors (invalid token).
*/
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('shootix_admin_token');
            // window.location.href = '/login'; // Let the AuthProvider handle this
        }
        return Promise.reject(error);
    }
);

export default api;
