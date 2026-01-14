import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Plus, AlertCircle, Clock } from 'lucide-react';
import { notificationService } from '../services/notificationService';

const Notifications = ({ onNotificationsChange, user }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchNotifications = async (currentPage) => {
        setLoading(true);
        try {
            const savedUser = JSON.parse(localStorage.getItem('jira_user'));
            const userId = user?.id || savedUser?.id;

            const data = await notificationService.getNotifications(currentPage, limit, userId);
            setNotifications(data.notifications || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(page);
    }, [page, user?.id]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleNotificationClick = async (notification) => {
        if (notification.isRead) return;

        // Optimistic update
        const updatedNotifications = notifications.map(n =>
            n.id === notification.id ? { ...n, isRead: 1 } : n
        );
        setNotifications(updatedNotifications);

        try {
            await notificationService.markAsRead(notification.id);

            // Notify parent to refresh unread count
            if (onNotificationsChange) {
                onNotificationsChange();
            }
        } catch (err) {
            console.error("Failed to mark notification as read", err);
            // Revert on error could be added here, but low impact if skipped for simple UI
        }
    };

    const getIconAndColor = (type) => {
        switch (type) {
            case 'due':
                return { icon: <Clock className="h-5 w-5" />, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', border: 'border-l-4 border-red-500' };
            case 'work_completed':
                return { icon: <Check className="h-5 w-5" />, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', border: 'border-l-4 border-green-500' };
            case 'work_deleted':
                return { icon: <Trash2 className="h-5 w-5" />, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', border: 'border-l-4 border-green-500' }; // User requested green for others
            case 'work_added':
                return { icon: <Plus className="h-5 w-5" />, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-l-4 border-green-500' }; // User requested green for others
            case 'project_created':
                return { icon: <AlertCircle className="h-5 w-5" />, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400', border: 'border-l-4 border-green-500' }; // User requested green for others
            default:
                return { icon: <Bell className="h-5 w-5" />, color: 'text-gray-600 bg-gray-100', border: 'border-l-4 border-green-500' };
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-border-light dark:border-border-dark bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Notifications</h1>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            Stay updated with recent activities and alerts
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10 text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 rounded-lg border border-border-light dark:border-gray-700">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const style = getIconAndColor(notif.type);
                                // Override borders based on user request: Red for due, Green for others
                                const finalBorder = notif.type === 'due' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500';

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${finalBorder} hover:shadow-md transition-shadow cursor-pointer ${notif.isRead ? 'opacity-75' : ''}`}
                                    >
                                        <div className={`p-2 rounded-full flex-shrink-0 mr-4 ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-light dark:text-text-dark">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                                {formatDate(notif.created_at)}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="px-8 py-4 border-t border-border-light dark:border-border-dark bg-white dark:bg-gray-800 flex items-center justify-between">
                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 border border-border-light dark:border-gray-600 rounded-md text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-border-light dark:border-gray-600 rounded-md text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
