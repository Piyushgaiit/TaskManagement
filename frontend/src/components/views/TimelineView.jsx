import React, { useState, useRef, useEffect } from 'react';

const TimelineView = ({ tasks = [] }) => {
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'weeks' | 'months'
    const [viewDate, setViewDate] = useState(new Date());
    const scrollContainerRef = useRef(null);
    const [columns, setColumns] = useState([]);
    const [timelineStart, setTimelineStart] = useState(null);

    // Configuration for each mode
    const MODE_CONFIG = {
        days: {
            colWidth: 40, // pixels per column
            pixelsPerDay: 40,
            range: 45 // +/- days to generate
        },
        weeks: {
            colWidth: 140, // pixels per week column
            pixelsPerDay: 20, // 140px / 7 days
            range: 12 // +/- weeks to generate
        },
        months: {
            colWidth: 200, // pixels per month column
            pixelsPerDay: 6.66, // approx 200px / 30 days
            range: 6 // +/- months to generate
        }
    };

    useEffect(() => {
        generateColumns();
    }, [viewDate, viewMode]);

    const generateColumns = () => {
        const cols = [];
        const baseDate = new Date(viewDate);

        if (viewMode === 'days') {
            // ... existing logic essentially ...
            const start = new Date(baseDate);
            start.setDate(start.getDate() - 15);
            setTimelineStart(new Date(start)); // Copy

            for (let i = 0; i < 45; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                cols.push({
                    date: date,
                    label: date.getDate(),
                    subLabel: date.toLocaleString('default', { weekday: 'narrow' }),
                    id: date.toISOString(),
                    isToday: date.toDateString() === new Date().toDateString()
                });
            }
        } else if (viewMode === 'weeks') {
            // align to sunday
            const start = new Date(baseDate);
            // Go back 4 weeks
            start.setDate(start.getDate() - (4 * 7));
            // Adjust to previous Sunday
            start.setDate(start.getDate() - start.getDay());

            setTimelineStart(new Date(start));

            for (let i = 0; i < 12; i++) {
                const weekStart = new Date(start);
                weekStart.setDate(weekStart.getDate() + (i * 7));

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                cols.push({
                    date: weekStart,
                    label: `${weekStart.getDate()} ${weekStart.toLocaleString('default', { month: 'short' })}`,
                    subLabel: `- ${weekEnd.getDate()} ${weekEnd.toLocaleString('default', { month: 'short' })}`,
                    id: weekStart.toISOString(),
                    isToday: new Date() >= weekStart && new Date() <= weekEnd
                });
            }
        } else if (viewMode === 'months') {
            const start = new Date(baseDate);
            start.setMonth(start.getMonth() - 2);
            start.setDate(1); // 1st of month

            setTimelineStart(new Date(start));

            for (let i = 0; i < 8; i++) {
                const monthStart = new Date(start);
                monthStart.setMonth(monthStart.getMonth() + i);

                // Check if current month
                const now = new Date();
                const isCurrentMonth = now.getMonth() === monthStart.getMonth() && now.getFullYear() === monthStart.getFullYear();

                cols.push({
                    date: monthStart,
                    label: monthStart.toLocaleString('default', { month: 'long' }),
                    subLabel: monthStart.getFullYear(),
                    id: monthStart.toISOString(),
                    isToday: isCurrentMonth
                });
            }
        }
        setColumns(cols);
    };

    // Helpers
    const getTaskStyle = (task) => {
        if (!task.startDate || !task.dueDate || task.startDate === 'None' || task.dueDate === 'None') return null;
        if (!timelineStart) return null;

        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);

        // Safety: treat invalid task status
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        const config = MODE_CONFIG[viewMode];

        // Calculate diff in days
        const diffTime = start.getTime() - timelineStart.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // Floating point days

        // Duration days
        const durationTime = end.getTime() - start.getTime();
        let durationDays = durationTime / (1000 * 60 * 60 * 24);
        // Ensure at least some width
        if (durationDays < 1) durationDays = 1;
        // For visual, add a bit if it's inclusive dates usually? 
        // If task is Jan 1 to Jan 1, it's 1 day. End-Start=0. So +1.
        durationDays += 1;

        const leftPos = diffDays * config.pixelsPerDay;
        const widthPos = durationDays * config.pixelsPerDay;

        return {
            left: `${leftPos}px`,
            width: `${widthPos}px`
        };
    };

    return (
        <div id="timeline-view" className="flex-grow flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            <header className="flex items-center justify-between px-6 py-3 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <span className="material-icons-outlined text-subtext-light dark:text-subtext-dark text-xl">search</span>
                        </span>
                        <input className="pl-9 pr-3 py-1.5 w-48 border border-border-light dark:border-border-dark rounded bg-background-light dark:bg-background-dark text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:text-text-dark placeholder-subtext-light dark:placeholder-subtext-dark" placeholder="Search timeline" type="text" />
                    </div>
                    {/* Avatars */}
                    <div className="flex -space-x-1 items-center">
                        <div className="h-8 w-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-xs font-medium z-10 border-2 border-white dark:border-gray-800">PG</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    <button
                        onClick={() => setViewMode('weeks')}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded ${viewMode === 'weeks' ? 'bg-white dark:bg-[#1d2125] text-primary shadow-sm' : 'text-text-secondary-light dark:text-subtext-dark hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Weeks
                    </button>
                    <button
                        onClick={() => setViewMode('months')}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded ${viewMode === 'months' ? 'bg-white dark:bg-[#1d2125] text-primary shadow-sm' : 'text-text-secondary-light dark:text-subtext-dark hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Months
                    </button>
                    <button
                        onClick={() => { setViewMode('days'); setViewDate(new Date()); }}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded ${viewMode === 'days' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary-light dark:text-subtext-dark hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Today
                    </button>
                </div>
            </header>

            <div className="timeline-grid flex-1 overflow-hidden relative border-t border-border-light dark:border-border-dark flex">
                {/* Left Panel: List of Tasks */}
                <div className="w-[300px] border-r border-border-light dark:border-border-dark flex flex-col bg-background-light dark:bg-background-dark z-20 shadow-lg shrink-0">
                    <div className="h-10 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-[#1E2125] flex items-center px-4 shrink-0">
                        <span className="text-xs font-bold uppercase text-subtext-light dark:text-subtext-dark">Work</span>
                    </div>
                    <div className="overflow-y-hidden hover:overflow-y-auto custom-scrollbar flex-1">
                        {tasks.map(task => (
                            <div key={task.id} className="h-10 flex items-center px-4 border-b border-border-light dark:border-border-dark hover:bg-hover-light dark:hover:bg-hover-dark cursor-pointer text-sm gap-2">
                                <span className={`material-icons-outlined text-sm ${task.status === 'DONE' ? 'text-green-500' : 'text-blue-500'}`}>
                                    {task.status === 'DONE' ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                <span className="truncate flex-1 text-text-light dark:text-text-dark">{task.title}</span>
                                <span className="text-xs text-subtext-light dark:text-subtext-dark">{task.key}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Gantt Chart */}
                <div className="flex-1 overflow-auto bg-white dark:bg-background-dark relative custom-scrollbar" ref={scrollContainerRef}>
                    <div className="min-w-max">
                        {/* Timeline Header (Dynamic) */}
                        <div className="h-10 flex border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-[#1E2125] sticky top-0 z-10">
                            {columns.map((col, i) => {
                                const widthStyle = { width: `${MODE_CONFIG[viewMode].colWidth}px`, minWidth: `${MODE_CONFIG[viewMode].colWidth}px` };
                                return (
                                    <div key={i} style={widthStyle} className={`flex flex-col items-center justify-center border-r border-border-light dark:border-border-dark text-xs ${col.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                        <span className={`font-semibold ${col.isToday ? 'text-primary' : 'text-subtext-light dark:text-subtext-dark'}`}>{col.label}</span>
                                        <span className="text-[9px] text-gray-400">{col.subLabel}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Task Rows (Bars) */}
                        <div className="min-w-max">
                            {tasks.map(task => {
                                const style = getTaskStyle(task);
                                return (
                                    <div key={task.id} className="h-10 border-b border-border-light/50 dark:border-border-dark/50 relative hover:bg-gray-50 dark:hover:bg-white/5">
                                        {/* Background Grid Lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {columns.map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{ width: `${MODE_CONFIG[viewMode].colWidth}px`, minWidth: `${MODE_CONFIG[viewMode].colWidth}px` }}
                                                    className="border-r border-border-light/20 dark:border-border-dark/20 h-full"
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Task Bar */}
                                        {style && (
                                            <div
                                                className="absolute top-2 h-6 rounded bg-primary hover:bg-primary-hover cursor-pointer z-10 shadow-sm flex items-center px-2 overflow-hidden transition-all duration-300"
                                                style={style}
                                                title={`${task.title} (${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.dueDate).toLocaleDateString()})`}
                                            >
                                                <span className="text-[10px] text-white font-medium truncate pointer-events-none">{task.key}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
