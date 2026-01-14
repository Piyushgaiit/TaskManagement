import api from './api';

export const userService = {
    getAllUsers: () => api.get('/users'),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, updates) => api.put(`/users/${id}`, updates)
};
