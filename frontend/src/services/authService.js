import api from './api';

export const authService = {
    login: (credentials) => api.post('/login', credentials),
    register: (userData) => api.post('/register', userData),
    logout: (userId) => api.post('/logout', { userId })
};
