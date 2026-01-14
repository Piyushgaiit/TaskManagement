import api from './api';

export const notificationService = {
    getNotifications: (page = 1, limit = 10, userId = null) => {
        let url = `/notifications?page=${page}&limit=${limit}`;
        if (userId) url += `&userId=${userId}`;
        return api.get(url);
    },
    markAsRead: (id) => api.put(`/notifications/${id}/read`, {})
};
