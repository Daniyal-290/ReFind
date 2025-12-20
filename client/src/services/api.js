import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

export const itemsAPI = {
    getAll: (params) => api.get('/items', { params }),
    getById: (id) => api.get(`/items/${id}`),
    getMyItems: () => api.get('/items/my-items'),
    create: (formData) => api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/items/${id}`)
};

export const claimsAPI = {
    create: (data) => api.post('/claims', data),
    getSent: () => api.get('/claims/sent'),
    getReceived: () => api.get('/claims/received'),
    approve: (id) => api.put(`/claims/${id}/approve`),
    reject: (id) => api.put(`/claims/${id}/reject`)
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    banUser: (id) => api.put(`/admin/users/${id}/ban`),
    getItems: (params) => api.get('/admin/items', { params }),
    deleteItem: (id) => api.delete(`/admin/items/${id}`)
};

export default api;
