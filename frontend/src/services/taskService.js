import api from './api';

export const taskService = {
    getTasks: (projectId, assignee) => {
        let qs = [];
        if (projectId) qs.push(`projectId=${projectId}`);
        if (assignee) qs.push(`assignee=${encodeURIComponent(assignee)}`);
        return api.get(`/tasks?${qs.join('&')}`);
    },
    createTask: (taskData) => api.post('/tasks', taskData),
    updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),
    deleteTask: (taskId, deletedBy) => api.delete(`/tasks/${taskId}?deletedBy=${deletedBy}`)
};
