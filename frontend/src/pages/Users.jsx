import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Clock, LogIn, LogOut, AlertTriangle, Check, X } from 'lucide-react';
import { userService } from '../services/userService';

const Users = ({ user: currentUser }) => {
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(data.users || []);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const startEditing = (user) => {
        setEditingId(user.id);
        setSelectedRole(user.role);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setSelectedRole('');
    };

    const handleRoleUpdate = async (userId) => {
        try {
            const data = await userService.updateUser(userId, {
                role: selectedRole,
                requesterId: currentUser.id
            });

            if (data && data.user) {

                // Optimistic update
                setUsers(users.map(u => u.id === userId ? { ...u, role: selectedRole } : u));
                setEditingId(null);
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'TMA':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Team Lead':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Developer':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'User':
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Header Section */}
            <div className="px-8 py-6 border-b border-border-light dark:border-border-dark bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">People</h1>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            Team members and roles {currentUser?.role === 'TMA' && '(Admin Access)'}
                        </p>
                    </div>

                </div>

                {/* Filters & Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md leading-5 bg-gray-50 dark:bg-gray-700 text-text-light dark:text-text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                    </div>

                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-auto p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-border-light dark:border-border-dark shadow-sm overflow-hidden overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Due Tasks
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Last Logout
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-border-light dark:divide-border-dark">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium text-sm overflow-hidden"
                                                    style={{ backgroundColor: user.avatarUrl ? 'transparent' : (user.avatarColor || '#1F2E4D') }}
                                                >
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-text-light dark:text-text-dark">
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === user.id ? (
                                                <select
                                                    value={selectedRole}
                                                    onChange={(e) => setSelectedRole(e.target.value)}
                                                    className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="User">User</option>
                                                    <option value="Team Lead">Team Lead</option>
                                                    <option value="Developer">Developer</option>
                                                    <option value="TMA">TMA (Admin)</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`flex items-center text-sm font-medium ${user.dueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                                                {user.dueCount > 0 && <AlertTriangle className="h-4 w-4 mr-2" />}
                                                {user.dueCount || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                <LogIn className="h-4 w-4 mr-2 text-green-500" />
                                                {formatDate(user.lastLogin)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                <LogOut className="h-4 w-4 mr-2 text-orange-500" />
                                                {formatDate(user.lastLogout)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingId === user.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleRoleUpdate(user.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded shadow-sm transition-colors">
                                                        Save
                                                    </button>
                                                    <button onClick={cancelEditing} className="text-red-600 hover:text-red-800 text-xs px-2 py-1">
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-3">
                                                    {currentUser?.role === 'TMA' && (
                                                        <button
                                                            onClick={() => startEditing(user)}
                                                            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-blue-500 transition-colors"
                                                            title="Change Role"
                                                        >
                                                            <span className="material-icons text-base">edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-10 text-text-secondary-light dark:text-text-secondary-dark">
                                No users found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
