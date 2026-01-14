import React, { useState } from 'react';
import Popover from './Popover';

// Priority Select Component
export const PrioritySelect = ({ priority, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const levels = [
        { name: 'Highest', icon: 'keyboard_double_arrow_up', color: 'text-red-500' },
        { name: 'High', icon: 'expand_less', color: 'text-red-500' },
        { name: 'Medium', icon: 'drag_handle', color: 'text-yellow-500' },
        { name: 'Low', icon: 'expand_more', color: 'text-blue-500' },
        { name: 'Lowest', icon: 'keyboard_double_arrow_down', color: 'text-blue-500' },
    ];

    const current = levels.find(l => l.name === priority) || levels[2];

    return (
        <div className="relative">
            <div
                onClick={(e) => { setAnchorEl(e.currentTarget); setIsOpen(true); }}
                className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c333a] cursor-pointer group transition-colors"
                title={`Priority: ${priority}`}
            >
                <span className={`material-icons ${current.color} text-[14px]`}>{current.icon}</span>
                <span className="text-[12px] text-gray-700 dark:text-[#b6c2cf]">{priority}</span>
                <span className="material-icons text-gray-400 text-[12px] opacity-0 group-hover:opacity-100">expand_more</span>
            </div>

            <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorEl={anchorEl} className="min-w-[150px] py-1">
                {levels.map(l => (
                    <div
                        key={l.name}
                        onClick={() => { onUpdate(l.name); setIsOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#1c2b41] cursor-pointer text-[13px] text-gray-700 dark:text-[#b6c2cf]"
                    >
                        <span className={`material-icons ${l.color} text-[18px]`}>{l.icon}</span>
                        <span>{l.name}</span>
                    </div>
                ))}
            </Popover>
        </div>
    );
};

// Status Select Component
export const StatusSelect = ({ status, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const statuses = [
        { name: 'TO DO', bg: 'bg-gray-200 dark:bg-[#2c333a]', text: 'text-gray-700 dark:text-[#9fadbc]' },
        { name: 'IN PROGRESS', bg: 'bg-blue-100 dark:bg-[#09326c]', text: 'text-blue-700 dark:text-[#579dff]' },
        { name: 'DONE', bg: 'bg-green-100 dark:bg-[#004d2e]', text: 'text-green-700 dark:text-[#4bce97]' },
    ];

    const current = statuses.find(s => s.name === status) || statuses[0];

    return (
        <div className="relative">
            <button
                onClick={(e) => { setAnchorEl(e.currentTarget); setIsOpen(true); }}
                className={`${current.bg} ${current.text} px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 hover:brightness-95 transition-all`}
            >
                {status}
                <span className="material-icons text-[10px]">expand_more</span>
            </button>

            <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorEl={anchorEl} className="min-w-[160px] py-2 px-2">
                <div className="text-[11px] font-bold text-gray-500 dark:text-[#9fadbc] uppercase px-2 mb-2">Change Status</div>
                {statuses.map(s => (
                    <div
                        key={s.name}
                        onClick={() => { onUpdate(s.name); setIsOpen(false); }}
                        className={`px-2 py-1.5 rounded mb-1 hover:brightness-90 cursor-pointer ${s.bg} ${s.text} text-[11px] font-bold uppercase text-center`}
                    >
                        {s.name}
                    </div>
                ))}
            </Popover>
        </div>
    );
};

// Simple Date Picker Component
export const DatePicker = ({ dateStr, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // Format the date string to be readable (e.g. "Jan 5, 2026")
    const formatDate = (str) => {
        if (!str || str === 'None') return 'None';
        const d = new Date(str);
        if (isNaN(d.getTime())) return str;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const displayDate = formatDate(dateStr);

    // Check overdue against the *input* string (which is ISO)
    const isOverdue = displayDate !== 'None' && new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();

    return (
        <div className="relative">
            <div
                onClick={(e) => { setAnchorEl(e.currentTarget); setIsOpen(true); }}
                className={`flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c333a] cursor-pointer text-[12px] ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-700 dark:text-[#b6c2cf]'}`}
            >
                <span className="material-icons text-[14px]">calendar_today</span>
                <span>{displayDate}</span>
            </div>

            <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorEl={anchorEl} className="p-3">
                <div className="flex flex-col gap-2">
                    <input
                        type="date"
                        className="bg-white dark:bg-[#22272b] border border-gray-300 dark:border-[#2c333a] rounded px-2 py-1 text-sm dark:text-white outline-none focus:border-primary"
                        onChange={(e) => {
                            if (e.target.value) {
                                // Save as complete ISO string to maintain compatibility
                                const d = new Date(e.target.value);
                                onUpdate(d.toISOString());
                                setIsOpen(false);
                            }
                        }}
                    />
                    <button
                        onClick={() => { onUpdate('None'); setIsOpen(false); }}
                        className="text-xs text-primary hover:underline"
                    >
                        Clear date
                    </button>
                </div>
            </Popover>
        </div>
    );
};

// Assignee Select Component
export const AssigneeSelect = ({ assignee, users, onUpdate, currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [search, setSearch] = useState('');

    const filteredUsers = (users || []).filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const isAdmin = currentUser && currentUser.role === 'TMA';

    return (
        <div className="relative">
            <div
                onClick={(e) => {
                    if (isAdmin) {
                        setAnchorEl(e.currentTarget);
                        setIsOpen(true);
                    }
                }}
                className={`flex items-center gap-2 ${isAdmin ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2c333a] p-1 rounded' : ''}`}
                title={isAdmin ? "Click to assign" : "Only Admin can assign"}
            >
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {/* Try to find user to get avatar if possible, else generic person */}
                    {users && users.find(u => u.name === assignee)?.avatarUrl ? (
                        <img src={users.find(u => u.name === assignee).avatarUrl} alt={assignee} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-icons text-gray-500 text-sm">person</span>
                    )}
                </div>
                <span className="text-[12px] truncate max-w-[100px] text-gray-700 dark:text-gray-300">
                    {assignee || 'Unassigned'}
                </span>
                {isAdmin && <span className="material-icons text-[10px] text-gray-400">expand_more</span>}
            </div>

            <Popover isOpen={isOpen} onClose={() => { setIsOpen(false); setSearch(''); }} anchorEl={anchorEl} className="min-w-[200px] p-2">
                <input
                    type="text"
                    placeholder="Search user..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full text-xs p-1.5 mb-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                />
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredUsers.map(u => (
                        <div
                            key={u.id}
                            onClick={() => { onUpdate(u.name); setIsOpen(false); setSearch(''); }}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded text-xs text-text-light dark:text-text-dark"
                        >
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                {u.avatarUrl ? (
                                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[9px] font-bold text-gray-600">{u.name.charAt(0)}</span>
                                )}
                            </div>
                            <span>{u.name}</span>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-2 text-xs text-text-secondary-light">No users found</div>
                    )}
                </div>
            </Popover>
        </div>
    );
};
