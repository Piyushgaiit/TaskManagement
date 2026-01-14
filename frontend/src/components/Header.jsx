import React, { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Header = ({ onCreateClick, user, onLogout, onToggleSidebar, isSidebarOpen, onViewChange, searchQuery, onSearch, unreadCount }) => {
    // Initialize dark mode state based on localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Apply the theme class to the HTML element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const getInitials = (name) => {
        if (!name) return 'PG';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <header className="h-[56px] flex items-center justify-between px-4 border-b border-border-light dark:border-[#2c333a] bg-white dark:bg-[#1d2125] text-text-light dark:text-[#b6c2cf] flex-shrink-0 z-20 transition-colors duration-200">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded transition-colors text-text-secondary-light dark:text-[#9fadbc]"
                >
                    {isSidebarOpen ? (
                        <PanelLeftClose size={20} strokeWidth={1.5} />
                    ) : (
                        <PanelLeftOpen size={20} strokeWidth={1.5} />
                    )}
                </button>
                {/* <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded transition-colors text-text-secondary-light dark:text-[#9fadbc]">
                    <span className="material-icons-outlined text-[20px]">apps</span>
                </button> */}

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer ml-2 pr-4">
                    <img src="/aiits_icon.png" alt="AIITS Icon" className="w-7 h-7 object-contain rounded-full border border-gray-200 shadow-sm" />
                    <span className="font-bold text-[18px] text-text-light dark:text-[#b6c2cf] tracking-tight">AIITS</span>
                </div>
            </div>

            {/* Middle Section - Search */}
            <div className="flex items-center justify-center flex-grow max-w-2xl px-8">
                <div className="relative w-full max-w-xl group">
                    <span className="material-icons-outlined absolute left-2.5 top-1.5 text-text-secondary-light dark:text-[#9fadbc] text-[18px]">search</span>
                    <input
                        className="w-full pl-9 pr-3 py-1.5 border border-border-light dark:border-[#626f86] bg-gray-50 dark:bg-[#1d2125] rounded-[4px] text-text-light dark:text-[#b6c2cf] placeholder-text-secondary-light dark:placeholder-[#9fadbc] focus:bg-white dark:focus:bg-[#22272b] focus:border-primary dark:focus:border-[#579dff] focus:ring-2 focus:ring-primary dark:focus:ring-[#0c66e4] outline-none text-sm transition-all"
                        placeholder="Search"
                        type="text"
                        value={searchQuery || ''}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded-full transition-colors text-text-secondary-light dark:text-[#9fadbc] mr-1"
                    title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                >
                    <span className="material-icons-outlined text-[20px]">
                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                {/* Create Button */}
                <button
                    onClick={onCreateClick}
                    className="h-8 px-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[3px] text-[14px] flex items-center gap-1.5 transition-colors mr-2"
                >
                    <span className="material-icons text-[18px]">add</span> Create
                </button>

                {/* Icons */}
                <button
                    onClick={() => onViewChange && onViewChange('notifications')}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded-full transition-colors text-text-secondary-light dark:text-[#9fadbc] relative"
                >
                    <span className="material-icons-outlined text-[20px]">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-[#1d2125]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                {/* <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded-full transition-colors text-text-secondary-light dark:text-[#9fadbc]">
                    <span className="material-icons-outlined text-[20px]">help_outline</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded-full transition-colors text-text-secondary-light dark:text-[#9fadbc]">
                    <span className="material-icons-outlined text-[20px]">settings</span>
                </button> */}

                {/* Avatar with dropdown */}
                <div className="relative">
                    <div
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-8 h-8 rounded-full bg-[#1F2E4D] border-2 border-white dark:border-[#1d2125] text-white flex items-center justify-center text-xs font-bold cursor-pointer ml-1 hover:brightness-110 transition-colors relative z-10 overflow-hidden"
                        style={{ backgroundColor: user?.avatarUrl ? 'transparent' : (user?.avatarColor || '#1F2E4D') }}
                    >
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(user?.name)
                        )}
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#22272b] rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    if (onViewChange) onViewChange('profile');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-light hover:bg-gray-100 dark:hover:bg-[#2c333a] transition-colors"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    onLogout();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#2c333a]"
                            >
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
