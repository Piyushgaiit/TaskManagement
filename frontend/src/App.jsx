import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ListView from './components/views/ListView';
import BoardView from './components/views/BoardView';
import SummaryView from './components/views/SummaryView';
import CalendarView from './components/views/CalendarView';
import TimelineView from './components/views/TimelineView';
import CreateProjectModal from './components/ui/CreateProjectModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import { authService } from './services/authService';
import { projectService } from './services/projectService';
import { taskService } from './services/taskService';
import { userService } from './services/userService';
import { notificationService } from './services/notificationService';

// const API_URL = ...; // Not needed directly anymore

function Dashboard({ user, onLogout, onUserUpdate }) {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'list');
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState(() => localStorage.getItem('currentView') || 'project'); // 'project', 'users', 'notifications', 'profile'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [users, setAllUsers] = useState([]); // Store all users for assignment

    const fetchUnreadCount = async () => {
        try {
            // Include userId in count check
            // Include userId in count check
            const userId = user ? user.id : null;
            const data = await notificationService.getNotifications(1, 1, userId);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error("Failed to fetch notification count", error);
        }
    };

    // Fetch all users for assignment dropdowns
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setAllUsers(data.users || []);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };
        fetchAllUsers();
    }, []);

    // Initial Load & Polling for Notifications
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getAllProjects();
                const loadedProjects = data.projects || [];
                setProjects(loadedProjects);

                // Set default project if none selected
                if (loadedProjects.length > 0 && !activeProjectId) {
                    setActiveProjectId(loadedProjects[0].id);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            }
        };
        fetchProjects();
        if (user) fetchUnreadCount();

        // Workaround: Short polling for notifications (every 5 seconds)
        // Ideally use WebSockets
        const interval = setInterval(() => {
            if (user) fetchUnreadCount();
        }, 5000);
        return () => clearInterval(interval);
    }, [user]); // Re-run if user changes

    // Persist View State
    useEffect(() => {
        localStorage.setItem('currentView', currentView);
    }, [currentView]);

    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    // Load Tasks when Project Changes
    useEffect(() => {
        // Only load tasks if we are in project view
        if (!activeProjectId || currentView !== 'project') return;

        const fetchTasks = async () => {
            setLoading(true);
            try {
                const data = await taskService.getTasks(activeProjectId);
                setTasks(data.tasks || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [activeProjectId, currentView]);

    // Create Project
    const handleProjectCreate = async (projectData) => {
        try {
            const data = await projectService.createProject({ ...projectData, creator: user ? user.name : 'Unknown' });

            if (data) {
                // Refresh projects list
                const loadedData = await projectService.getAllProjects();
                const newProjects = loadedData.projects || [];
                setProjects(newProjects);

                // Switch to new project
                if (data.id) {
                    setActiveProjectId(data.id);
                    setCurrentView('project');
                }
            }
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };


    // Delete Project
    const handleProjectDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            await projectService.deleteProject(projectId);

            // Refresh
            const data = await projectService.getAllProjects();
            const loadedProjects = data.projects || [];
            setProjects(loadedProjects);

            // If active project was deleted, switch to another
            if (activeProjectId === projectId) {
                setActiveProjectId(loadedProjects.length > 0 ? loadedProjects[0].id : null);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. You may not be authorized.');
        }
    };

    // Update Task
    const handleTaskUpdate = async (taskId, updates) => {
        // Find the task in current state (before update)
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Rule 1: Prevent Parent -> DONE if subtasks match pending criteria
        if (updates.status === 'DONE') {
            const subtasks = tasks.filter(t => t.parentId === taskId);
            // If it has subtasks, and ANY of them is NOT done, block the update
            if (subtasks.length > 0) {
                const hasPendingSubtasks = subtasks.some(t => t.status !== 'DONE');
                if (hasPendingSubtasks) {
                    alert('Cannot mark main task as Done because there are pending subtasks.');
                    return; // Abort update
                }
            }
        }

        // Prepare for Optimistic Update
        const originalTasks = [...tasks];
        let parentToUpdate = null;
        let parentUpdates = null;

        // Calculate potential Parent auto-updates (if this is a subtask)
        if (task.parentId) {
            const parent = tasks.find(p => p.id === task.parentId);
            if (parent) {
                // We need to look at the *projected* state of siblings
                // Get all siblings (including self)
                const siblings = tasks.filter(t => t.parentId === task.parentId);

                // Check status of siblings *assuming* the current update applies
                const areAllSiblingsDone = siblings.every(s => {
                    const status = (s.id === taskId && updates.status) ? updates.status : s.status;
                    return status === 'DONE';
                });

                if (areAllSiblingsDone && parent.status !== 'DONE') {
                    // Auto-complete Parent
                    parentToUpdate = parent;
                    parentUpdates = { status: 'DONE', resolution: 'Done', updated: new Date().toLocaleString() };
                } else if (!areAllSiblingsDone && parent.status === 'DONE' && updates.status && updates.status !== 'DONE') {
                    // Re-open Parent (if previously done)
                    parentToUpdate = parent;
                    parentUpdates = { status: 'IN PROGRESS', resolution: 'Unresolved', updated: new Date().toLocaleString() };
                }
            }
        }

        // Apply Updates to State (Optimistic)
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) return { ...t, ...updates };
            if (parentToUpdate && t.id === parentToUpdate.id) return { ...t, ...parentUpdates };
            return t;
        }));

        try {
            // 1. Update the actual task
            await taskService.updateTask(taskId, {
                ...updates,
                modifiedBy: user ? user.name : 'Unknown',
                modifierId: user ? user.id : null
            });

            // 2. Update the parent if necessary
            if (parentToUpdate && parentUpdates) {
                await taskService.updateTask(parentToUpdate.id, {
                    ...parentUpdates,
                    modifiedBy: user ? user.name : 'Unknown',
                    modifierId: user ? user.id : null
                });
            }
        } catch (error) {
            console.error('Error updating task:', error);
            setTasks(originalTasks); // Revert all changes
            alert('Failed to update task.');
        }
    };

    // Create Task
    const handleTaskCreate = async (taskData) => {
        if (!activeProjectId) return;

        try {
            const activeProject = projects.find(p => p.id === activeProjectId);
            const projectKey = activeProject ? activeProject.key : 'KAN';

            // Calculate max ID for the CURRENT project
            const maxId = tasks.reduce((max, t) => {
                if (!t.key.startsWith(projectKey)) return max;
                const parts = t.key.split('-');
                if (parts.length < 2) return max;
                const keyNum = parseInt(parts[1]);
                return !isNaN(keyNum) && keyNum > max ? keyNum : max;
            }, 0);

            const nextKey = `${projectKey}-${maxId + 1}`;
            const now = new Date();
            const timestamp = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

            const newTask = {
                key: nextKey,
                title: taskData.title,
                assignee: 'Unassigned',
                reporter: user ? user.name : 'Piyush Gaygole',
                priority: 'Medium',
                status: 'TO DO',
                resolution: 'Unresolved',
                created: timestamp,
                updated: timestamp,
                startDate: taskData.startDate || now.toISOString(),
                dueDate: taskData.dueDate || null,
                parentId: taskData.parentId || null,
                expanded: 0,
                projectId: activeProjectId // CRITICAL
            };

            await taskService.createTask(newTask);

            // Re-fetch to ensure sync
            const data = await taskService.getTasks(activeProjectId);
            setTasks(data.tasks || []);

        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    // Delete Task
    const handleTaskDelete = async (taskId) => {
        const originalTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            const userName = user ? encodeURIComponent(user.name) : 'Unknown';
            await taskService.deleteTask(taskId, userName);
        } catch (error) {
            console.error('Error deleting task:', error);
            setTasks(originalTasks);
        }
    };

    // Bulk Delete
    const handleTasksDelete = async (taskIds) => {
        const originalTasks = [...tasks];
        const idsArray = Array.from(taskIds);
        setTasks(prev => prev.filter(t => !taskIds.has(t.id)));

        try {
            const userName = user ? encodeURIComponent(user.name) : 'Unknown';
            await Promise.all(idsArray.map(id =>
                taskService.deleteTask(id, userName)
            ));
        } catch (error) {
            console.error('Error bulk deleting tasks:', error);
            setTasks(originalTasks);
        }
    };

    // Get Active Project Details
    const currentProject = projects.find(p => p.id === activeProjectId) || { name: 'Loading...', type: 'Project' };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body text-sm">
            <Header
                onCreateClick={() => setIsProjectModalOpen(true)}
                user={user}
                onLogout={onLogout}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                onViewChange={setCurrentView}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                unreadCount={unreadCount}
            />

            <div className="flex flex-grow overflow-hidden">
                <Sidebar
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onProjectSelect={setActiveProjectId}
                    onViewChange={setCurrentView}
                    currentView={currentView}
                    isOpen={isSidebarOpen}
                    user={user}
                    onProjectDelete={handleProjectDelete}
                />

                <main className="flex-grow flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
                    {currentView === 'users' ? (
                        <Users user={user} />
                    ) : currentView === 'notifications' ? (
                        <Notifications onNotificationsChange={fetchUnreadCount} user={user} />
                    ) : currentView === 'profile' ? (
                        <Profile user={user} onUserUpdate={onUserUpdate} />
                    ) : (
                        <>
                            {/* Main Top Header */}
                            <div className="px-6 pt-3 pb-0 flex-shrink-0">
                                <div className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                    <span>Projects</span>
                                    <span>/</span>
                                    <span>{currentProject.name}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-xl font-bold text-text-light dark:text-text-dark">{currentProject.name}</h1>

                                </div>

                                {/* Tabs */}
                                <div className="flex items-center gap-6 border-b border-border-light dark:border-border-dark">
                                    {['Summary', 'List', 'Board', 'Calendar', 'Timeline', 'Issues', 'Reports'].map(tab => {
                                        const id = tab.toLowerCase();
                                        const isActive = activeTab === id;
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => setActiveTab(id)}
                                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-text-secondary-light dark:text-text-secondary-dark border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-primary'}`}
                                            >
                                                {tab}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="h-2"></div>
                            </div>

                            {/* Views Content */}
                            <div className="flex-grow flex flex-col overflow-hidden relative">
                                {loading && tasks.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">Loading tasks...</div>
                                ) : (
                                    <>
                                        {(() => {
                                            const filteredTasks = tasks.filter(task =>
                                                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                task.key.toLowerCase().includes(searchQuery.toLowerCase())
                                            );

                                            return (
                                                <>
                                                    {activeTab === 'list' && (
                                                        <ListView
                                                            tasks={filteredTasks}
                                                            onTaskUpdate={handleTaskUpdate}
                                                            onTaskCreate={handleTaskCreate}
                                                            onTaskDelete={handleTaskDelete}
                                                            onTasksDelete={handleTasksDelete}
                                                            users={users}
                                                            currentUser={user}
                                                        />
                                                    )}
                                                    {activeTab === 'board' && (
                                                        <BoardView
                                                            tasks={filteredTasks}
                                                            onTaskUpdate={handleTaskUpdate}
                                                            currentUser={user}
                                                        />
                                                    )}
                                                    {activeTab === 'summary' && (
                                                        <SummaryView tasks={filteredTasks} />
                                                    )}
                                                    {activeTab === 'calendar' && (
                                                        <CalendarView
                                                            tasks={filteredTasks}
                                                            onTaskUpdate={handleTaskUpdate}
                                                            onTaskCreate={handleTaskCreate}
                                                        />
                                                    )}
                                                    {activeTab === 'timeline' && <TimelineView tasks={filteredTasks} />}
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onCreate={handleProjectCreate}
            />
        </div>
    );
}

function App() {
    // Check local storage for user
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('jira_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('jira_user', JSON.stringify(userData));
    };

    // Refresh user data on mount to ensure role is up to date
    useEffect(() => {
        if (user && user.id) {
            const fetchLatestUser = async () => {
                try {
                    const data = await userService.getUserById(user.id);
                    if (data.user) {
                        // Only update if there are changes to avoid loop (though useEffect dependency is empty array)
                        // But actually we want to force update local storage
                        const refreshedUser = data.user;
                        setUser(refreshedUser);
                        localStorage.setItem('jira_user', JSON.stringify(refreshedUser));
                    }
                } catch (err) {
                    console.error("Failed to refresh user data", err);
                }
            };
            fetchLatestUser();
        }
    }, []); // Run once on mount

    const handleLogout = async () => {
        if (user) {
            try {
                // Inform backend of logout
                await authService.logout(user.id);
            } catch (err) {
                console.error("Logout error", err);
            }
        }
        setUser(null);
        localStorage.removeItem('jira_user');
    };

    const handleUserUpdate = (userData) => {
        setUser(userData);
        localStorage.setItem('jira_user', JSON.stringify(userData));
    };

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route
                path="/*"
                element={
                    user ? <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />
                }
            />
        </Routes>
    );
}

export default App;
