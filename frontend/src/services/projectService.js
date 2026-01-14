import api from './api';

export const projectService = {
    getAllProjects: () => api.get('/projects'),
    createProject: (projectData) => api.post('/projects', projectData),
    deleteProject: (id) => api.delete(`/projects/${id}`)
};
