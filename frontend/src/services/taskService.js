import api from './api';

export const taskService = {
    getTasks: (projectId) => api.get(`/tasks?projectId=${projectId}`),
    createTask: (taskData) => api.post('/tasks', taskData),
    updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),
    deleteTask: (taskId, deletedBy) => api.delete(`/tasks/${taskId}?deletedBy=${deletedBy}`)
};
