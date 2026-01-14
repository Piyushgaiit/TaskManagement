const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = {
    getHeaders: () => {
        const user = JSON.parse(localStorage.getItem('jira_user'));
        return {
            'Content-Type': 'application/json',
            ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        };
    },

    get: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    post: async (endpoint, body) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    put: async (endpoint, body) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: api.getHeaders(),
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    delete: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }
};

export default api;
