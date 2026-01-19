
import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';

const ForYou = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Admin View State
    const [groupedTasks, setGroupedTasks] = useState({});

    useEffect(() => {
        if (!user) return;

        // Determine role (Assuming TMA is Admin based on sidebar logic)
        const checkAdmin = user.role === 'TMA';
        setIsAdmin(checkAdmin);

        const fetchData = async () => {
            setLoading(true);
            try {
                if (checkAdmin) {
                    // Admin: Fetch ALL tasks
                    const data = await taskService.getTasks(null);
                    const allTasks = data.tasks || [];

                    // Group by Assignee
                    const groups = allTasks.reduce((acc, task) => {
                        const assignee = task.assignee || 'Unassigned';
                        if (!acc[assignee]) acc[assignee] = [];
                        acc[assignee].push(task);
                        return acc;
                    }, {});

                    setGroupedTasks(groups);
                } else {
                    // Regular User: Fetch MY tasks
                    // We assume 'user.name' matches the 'assignee' string in tasks
                    const data = await taskService.getTasks(null, user.name);
                    setTasks(data.tasks || []);
                }
            } catch (error) {
                console.error("Failed to load 'For You' data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Helper to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'TO DO': return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            case 'IN PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'DONE': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 dark:bg-gray-800';
        }
    };

    // Helper to get priority icon
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'High': return <span className="material-icons text-red-500 text-sm">arrow_upward</span>;
            case 'Medium': return <span className="material-icons text-yellow-500 text-sm">remove</span>;
            case 'Low': return <span className="material-icons text-blue-400 text-sm">arrow_downward</span>;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
                Loading your work...
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-border-light dark:border-border-dark flex-shrink-0">
                <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
                    {isAdmin ? 'Team Workload Overview' : 'Your Work'}
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    {isAdmin
                        ? 'Monitor tasks assigned to all team members.'
                        : `Welcome back, ${user.name}. Here is what you need to work on.`}
                </p>
            </div>

            {/* Content Scroller */}
            <div className="flex-grow overflow-y-auto p-8">
                {isAdmin ? (
                    // Admin View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.keys(groupedTasks).length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 mt-10">No active tasks found across projects.</div>
                        ) : (
                            Object.entries(groupedTasks).map(([assignee, userTasks]) => (
                                <div key={assignee} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark flex flex-col h-fit max-h-[500px]">
                                    <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                                                {assignee.slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-text-light dark:text-text-dark">{assignee}</h3>
                                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{userTasks.length} tasks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 overflow-y-auto custom-scrollbar">
                                        {userTasks.map(task => (
                                            <div key={task.id} className="p-3 mb-2 rounded border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <a href="#" className="text-xs font-semibold hover:underline text-text-secondary-light dark:text-text-secondary-dark">{task.key}</a>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium text-text-light dark:text-text-dark mb-2 line-clamp-2" title={task.title}>
                                                    {task.title}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getPriorityIcon(task.priority)}
                                                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{task.priority}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // User View
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <span className="material-icons text-4xl text-gray-400 mb-2">check_circle_outline</span>
                                    <h3 className="text-lg font-medium text-text-light dark:text-text-dark">All caught up!</h3>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark">You have no tasks assigned to you right now.</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-border-light dark:border-border-dark hover:shadow-md transition-shadow flex items-center justify-between group">
                                        <div className="flex-grow min-w-0 pr-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors">{task.key}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-1 truncate">{task.title}</h3>
                                            <div className="flex items-center gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                <span className="flex items-center gap-1">
                                                    {getPriorityIcon(task.priority)}
                                                    {task.priority} Priority
                                                </span>
                                                {task.dueDate && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-icons text-xs">calendar_today</span>
                                                        Due {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {/* Action (e.g. Move to Done) could go here */}
                                            <button className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                                                <span className="material-icons">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForYou;
