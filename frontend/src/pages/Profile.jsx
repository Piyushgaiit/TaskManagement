import React, { useState, useRef } from 'react';
import { Camera, User, Mail, Shield, Save, Loader, Lock } from 'lucide-react';
import { userService } from '../services/userService';

const Profile = ({ user, onUserUpdate }) => {
    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result); // This will be a base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (password && password !== confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            const data = await userService.updateUser(user.id, {
                name,
                avatarUrl,
                ...(password ? { password } : {})
            });

            if (data && data.user) {
                setSuccessMessage('Profile updated successfully!');
                if (onUserUpdate) {
                    onUserUpdate(data.user);
                }
            } else {
                setError('Failed to update profile');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex justify-center min-h-min pb-20">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
                        <div className="px-8 py-6 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-900/50">
                            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Profile Settings</h1>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                Manage your account information and appearances
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden relative bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-4xl font-bold text-gray-400" style={{ color: user?.avatarColor }}>
                                                {(user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md border-2 border-white dark:border-gray-800">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Click to upload new photo
                                </p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark">
                                            <User className="w-4 h-4" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 border border-border-light dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark">
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-border-light dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900/50 text-text-secondary-light dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark">
                                        <Shield className="w-4 h-4" />
                                        Role
                                    </label>
                                    <div className="flex items-center">
                                        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${user?.role === 'TMA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            {user?.role || 'User'}
                                        </span>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-light dark:border-border-dark">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark">
                                            <Lock className="w-4 h-4" />
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-border-light dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-light dark:text-text-dark">
                                            <Lock className="w-4 h-4" />
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-border-light dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Messages */}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800">
                                    {error}
                                </div>
                            )}
                            {successMessage && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md text-sm border border-green-200 dark:border-green-800">
                                    {successMessage}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
