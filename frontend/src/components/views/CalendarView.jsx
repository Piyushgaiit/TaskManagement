import React, { useState, useEffect, useRef } from 'react';

const CalendarView = ({ tasks = [], onTaskUpdate, onTaskCreate }) => {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTask, setDraggedTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false);

    // Create Popover State
    const [createPopover, setCreatePopover] = useState({ visible: false, x: 0, y: 0, date: null, title: '' });

    // Resizing State
    const [resizingTask, setResizingTask] = useState(null);
    const containerRef = useRef(null);

    // --- Helpers ---
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const toLocalISOString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getWeeksInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const weeks = [];
        let currentWeek = [];

        let startDay = firstDayOfMonth.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        for (let i = 0; i < startDay; i++) {
            const d = new Date(year, month, 1 - (startDay - i));
            currentWeek.push({ date: d, isCurrentMonth: false, iso: toLocalISOString(d) });
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const d = new Date(year, month, i);
            currentWeek.push({ date: d, isCurrentMonth: true, iso: toLocalISOString(d) });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            let nextVal = 1;
            while (currentWeek.length < 7) {
                const d = new Date(year, month + 1, nextVal++);
                currentWeek.push({ date: d, isCurrentMonth: false, iso: toLocalISOString(d) });
            }
            weeks.push(currentWeek);
        }
        return weeks;
    };

    const getWeekDays = (date) => {
        const startDay = date.getDay();
        const diff = date.getDate() - startDay + (startDay === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(date);
        startOfWeek.setDate(diff);

        const result = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            result.push({
                date: d,
                isCurrentMonth: true,
                iso: toLocalISOString(d)
            });
        }
        return [result]; // wrap in array to match 'weeks' structure (array of arrays)
    };

    // --- Handlers ---
    const handlePrev = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (viewMode === 'week') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 7);
            setCurrentDate(d);
        } else if (viewMode === 'year') {
            setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (viewMode === 'week') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 7);
            setCurrentDate(d);
        } else if (viewMode === 'year') {
            setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
        }
    };

    const handleToday = () => setCurrentDate(new Date());

    const updateTaskDate = async (id, newStartStr, newEndStr) => {
        if (onTaskUpdate) {
            onTaskUpdate(id, { startDate: newStartStr, dueDate: newEndStr });
        }
    };

    const handleCreateTask = async () => {
        if (!createPopover.title.trim() || !createPopover.date) return;

        if (onTaskCreate) {
            const newTask = {
                title: createPopover.title,
                startDate: new Date(createPopover.date).toISOString(),
                dueDate: new Date(createPopover.date).toISOString(),
            };
            await onTaskCreate(newTask);
            setCreatePopover({ visible: false, x: 0, y: 0, date: null, title: '' });
        }
    };

    const handleCellClick = (e, dateIso) => {
        if (draggedTask || resizingTask) return;
        setCreatePopover({ visible: true, x: e.clientX, y: e.clientY, date: dateIso, title: '' });
    };

    // --- Drag & Drop / Resize ---
    const handleDragStart = (e, task) => {
        if (e.target.closest('.resize-handle')) { e.preventDefault(); return; }
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(task));
    };

    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    const handleDrop = (e, targetIso) => {
        e.preventDefault();
        if (!draggedTask) return;
        const oldStart = new Date(draggedTask.startDate);
        const oldEnd = new Date(draggedTask.dueDate);
        const duration = oldEnd.getTime() - oldStart.getTime();
        const newStart = new Date(targetIso);
        const newEnd = new Date(newStart.getTime() + duration);
        updateTaskDate(draggedTask.id, newStart.toISOString(), newEnd.toISOString());
        setDraggedTask(null);
    };

    const handleResizeStart = (e, task) => {
        e.preventDefault(); e.stopPropagation();
        setResizingTask({ task, startX: e.clientX, initialEndDate: new Date(task.dueDate) });
    };

    useEffect(() => {
        if (!resizingTask) return;
        const handleMouseUp = (e) => {
            const deltaX = e.clientX - resizingTask.startX;
            const row = document.querySelector('.week-row');
            if (row) {
                const dayWidth = row.clientWidth / 7;
                const daysDiff = Math.round(deltaX / dayWidth);
                if (daysDiff !== 0) {
                    const newEnd = new Date(resizingTask.initialEndDate);
                    newEnd.setDate(newEnd.getDate() + daysDiff);
                    const start = new Date(resizingTask.task.startDate);
                    if (newEnd >= start) updateTaskDate(resizingTask.task.id, resizingTask.task.startDate, newEnd.toISOString());
                }
            }
            setResizingTask(null);
        };
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [resizingTask, tasks]);

    // --- Layout ---
    const placeTasksInWeek = (weekDays, tasks) => {
        const weekStartIso = weekDays[0].iso;
        const weekEndIso = weekDays[6].iso;

        // Filter tasks based on search
        const filteredTasks = tasks.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.key.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const relevantTasks = filteredTasks.map(t => {
            if (!t.startDate || !t.dueDate) return null;
            const tStart = t.startDate.split('T')[0];
            const tEnd = t.dueDate.split('T')[0];
            if (tEnd < weekStartIso || tStart > weekEndIso) return null;
            const colStart = weekDays.findIndex(d => d.iso === (tStart < weekStartIso ? weekStartIso : tStart));
            const colEnd = weekDays.findIndex(d => d.iso === (tEnd > weekEndIso ? weekEndIso : tEnd));
            const startIdx = colStart === -1 ? 0 : colStart;
            const endIdx = colEnd === -1 ? 6 : colEnd;
            return { ...t, colStart: startIdx, span: (endIdx - startIdx) + 1 };
        }).filter(Boolean);

        relevantTasks.sort((a, b) => {
            if (a.colStart !== b.colStart) return a.colStart - b.colStart;
            return b.span - a.span;
        });

        const grid = [];
        relevantTasks.forEach(task => {
            let row = 0;
            while (true) {
                if (!grid[row]) grid[row] = new Set();
                let collision = false;
                for (let i = task.colStart; i < task.colStart + task.span; i++) {
                    if (grid[row].has(i)) { collision = true; break; }
                }
                if (!collision) {
                    for (let i = task.colStart; i < task.colStart + task.span; i++) grid[row].add(i);
                    task.visualRow = row;
                    break;
                }
                row++;
            }
        });
        return { tasks: relevantTasks, rowsCount: grid.length };
    };

    let visibleWeeks = [];
    if (viewMode === 'month') {
        visibleWeeks = getWeeksInMonth(currentDate);
    } else if (viewMode === 'week') {
        visibleWeeks = getWeekDays(currentDate);
    } else if (viewMode === 'year') {
        // Fallback to month view for simplicity but nav changes year
        visibleWeeks = getWeeksInMonth(currentDate);
    }

    const formatDateLabel = (date) => (date.getDate() === 1 || viewMode === 'week' ? date.toLocaleString('default', { month: 'short', day: 'numeric' }) : date.getDate());

    const getDateLabel = () => {
        if (viewMode === 'month') return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (viewMode === 'week') {
            const weeks = getWeekDays(currentDate)[0];
            const first = weeks[0].date;
            const last = weeks[6].date;
            const startMonth = first.toLocaleString('default', { month: 'short' });
            const endMonth = last.toLocaleString('default', { month: 'short' });
            if (startMonth === endMonth) return `${startMonth} ${first.getFullYear()}`;
            return `${startMonth} - ${endMonth} ${last.getFullYear()}`;
        }
        return currentDate.getFullYear();
    };

    // --- Sub-components (Themed) ---
    const TaskDetailModal = ({ task, onClose }) => {
        const [localTask, setLocalTask] = useState({ ...task });
        const saveChanges = async () => {
            updateTaskDate(localTask.id, localTask.startDate, localTask.dueDate);
            onClose();
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white dark:bg-[#2C2E35] text-text-light dark:text-gray-200 rounded-lg shadow-2xl w-[500px] p-0 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-border-light dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-[#24272A]">
                        <div className="flex items-center gap-2"><div className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{localTask.key}</div></div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><span className="material-icons">close</span></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                        <input className="text-xl font-semibold bg-transparent border-none focus:ring-0 p-0 text-text-light dark:text-white placeholder-gray-400" value={localTask.title} onChange={e => setLocalTask({ ...localTask, title: e.target.value })} />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-text-secondary-light dark:text-gray-500 uppercase">Start</label>
                                <input type="date" className="w-full mt-1 border border-border-light dark:border-gray-600 rounded p-1.5 bg-white dark:bg-[#1E2125] text-text-light dark:text-gray-300 text-sm" value={localTask.startDate ? localTask.startDate.split('T')[0] : ''} onChange={e => setLocalTask({ ...localTask, startDate: new Date(e.target.value).toISOString() })} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-text-secondary-light dark:text-gray-500 uppercase">Due</label>
                                <input type="date" className="w-full mt-1 border border-border-light dark:border-gray-600 rounded p-1.5 bg-white dark:bg-[#1E2125] text-text-light dark:text-gray-300 text-sm" value={localTask.dueDate ? localTask.dueDate.split('T')[0] : ''} onChange={e => setLocalTask({ ...localTask, dueDate: new Date(e.target.value).toISOString() })} />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border-light dark:border-gray-600 bg-gray-50 dark:bg-[#24272A] flex justify-end gap-2">
                        <button onClick={onClose} className="px-3 py-1.5 text-sm font-medium text-text-light dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">Cancel</button>
                        <button onClick={saveChanges} className="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded transition-colors">Save</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div id="calendar-view" className="flex-grow flex flex-col overflow-hidden bg-background-light dark:bg-background-dark h-full select-none text-text-light dark:text-gray-300 font-sans transition-colors duration-200">
            {/* --- Toolbar --- */}
            <div className="flex flex-col gap-2 py-2 px-4 shrink-0 border-b border-border-light dark:border-gray-700 bg-white dark:bg-background-dark">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="material-icons absolute left-2 top-1.5 text-gray-400 text-[16px]">search</span>
                            {/* SEARCH INPUT WIRED UP */}
                            <input
                                className="pl-7 pr-3 py-1 text-xs bg-gray-50 dark:bg-[#2C2E35] border border-border-light dark:border-gray-600 rounded text-text-light dark:text-gray-300 focus:outline-none focus:border-primary w-36 placeholder-gray-400"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center px-2 py-1 text-xs bg-gray-50 dark:bg-[#1C2B41] text-primary dark:text-blue-400 border border-border-light dark:border-blue-900/50 rounded hover:brightness-95 dark:hover:brightness-110 transition-all font-medium">Assignee: Unassigned <span className="material-icons text-[14px] ml-1">keyboard_arrow_down</span></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleToday} className="px-2 py-1 bg-gray-100 dark:bg-[#2C2E35] text-xs font-medium border border-border-light dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-text-light dark:text-gray-300 transition-colors">Today</button>
                        <div className="flex items-center bg-gray-100 dark:bg-[#2C2E35] rounded border border-border-light dark:border-gray-600">
                            {/* PREV/NEXT BUTTONS WIRED UP */}
                            <button onClick={handlePrev} className="px-1.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-border-light dark:border-gray-600 rounded-l text-text-secondary-light dark:text-gray-400"><span className="material-icons text-xs">chevron_left</span></button>
                            <div className="px-2 text-xs font-medium min-w-[100px] text-center text-text-light dark:text-gray-300">{getDateLabel()}</div>
                            <button onClick={handleNext} className="px-1.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 border-l border-border-light dark:border-gray-600 rounded-r text-text-secondary-light dark:text-gray-400"><span className="material-icons text-xs">chevron_right</span></button>
                        </div>

                        {/* VIEW MODE SELECTOR */}
                        <div className="relative group">
                            <button className="flex items-center px-2 py-1 bg-gray-100 dark:bg-[#2C2E35] border border-border-light dark:border-gray-600 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 text-text-light dark:text-gray-300 transition-colors w-20 justify-between">
                                <span className="capitalize">{viewMode}</span>
                                <span className="material-icons text-[14px] text-gray-400">keyboard_arrow_down</span>
                            </button>
                            <div className="absolute top-full right-0 mt-1 w-24 bg-white dark:bg-[#2C2E35] border border-border-light dark:border-gray-600 rounded shadow-lg hidden group-hover:block z-20">
                                {['week', 'month', 'year'].map(mode => (
                                    <div
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className="px-3 py-1.5 text-xs text-text-light dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer capitalize"
                                    >
                                        {mode}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Calendar Grid (Compact) --- */}
            <div className="flex-grow flex flex-col bg-white dark:bg-background-dark px-4 pb-2 pt-1 overflow-hidden transition-colors duration-200">
                <div className="flex flex-col flex-grow border border-border-light dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <div className="grid grid-cols-7 border-b border-border-light dark:border-gray-700 bg-gray-50 dark:bg-background-dark">
                        {daysOfWeek.map(d => (<div key={d} className="py-2 text-xs font-semibold text-text-secondary-light dark:text-gray-400 text-center uppercase tracking-wider">{d}</div>))}
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar bg-white dark:bg-background-dark" ref={containerRef}>
                        <div className="flex flex-col min-h-full">
                            {visibleWeeks.map((week, wIndex) => {
                                const { tasks: weekTasks, rowsCount } = placeTasksInWeek(week, tasks);

                                const isWeekMode = viewMode === 'week';
                                const minRowHeight = isWeekMode ? 500 : 90;
                                const rowHeight = Math.max(minRowHeight, (rowsCount * 24) + 30);

                                return (
                                    <div key={wIndex} className="week-row relative border-b border-border-light dark:border-gray-700 flex-shrink-0" style={{ height: rowHeight }}>
                                        <div className="absolute inset-0 grid grid-cols-7 h-full pointer-events-none">
                                            {week.map((day, dIndex) => (
                                                <div
                                                    key={dIndex}
                                                    className={`border-r border-border-light dark:border-gray-700 p-1 pointer-events-auto transition-colors ${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-[#181a1d]' : ''} hover:bg-gray-100 dark:hover:bg-gray-800/30`}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, day.iso)}
                                                    onClick={(e) => handleCellClick(e, day.iso)}
                                                >
                                                    <span className={`text-[10px] font-bold inline-block px-1.5 py-0.5 rounded-sm ${day.iso === new Date().toISOString().split('T')[0] ? 'bg-primary text-white' : 'text-text-secondary-light dark:text-gray-400'}`}>
                                                        {formatDateLabel(day.date)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute inset-x-0 top-8 w-full px-0">
                                            {weekTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task)}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                                                    className="absolute h-[20px] rounded-sm text-[10px] flex items-center cursor-pointer hover:opacity-90 z-10 transition-colors shadow-sm"
                                                    style={{
                                                        top: `${task.visualRow * 24}px`,
                                                        left: `calc(${task.colStart * 14.28}% + 2px)`,
                                                        width: `calc(${task.span * 14.28}% - 5px)`,
                                                        backgroundColor: task.status === 'DONE' ? '#006644' : (task.status === 'IN PROGRESS' ? '#0747A6' : '#2684FF'),
                                                        color: '#FFFFFF',
                                                    }}
                                                >
                                                    <div className="flex-1 px-1.5 flex items-center gap-1 truncate">
                                                        <span className="font-bold flex-shrink-0 opacity-100">{task.key}</span>
                                                        <span className="truncate opacity-90">{task.title}</span>
                                                    </div>
                                                    <div className="resize-handle w-2 h-full cursor-ew-resize hover:bg-white/20 flex-shrink-0" onMouseDown={(e) => handleResizeStart(e, task)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}

            {/* Create Popover */}
            {createPopover.visible && (
                <div
                    className="fixed z-50 bg-white dark:bg-[#2C2E35] border border-primary dark:border-blue-500 rounded shadow-2xl p-3 w-[280px] flex flex-col gap-3"
                    style={{ top: createPopover.y, left: Math.min(createPopover.x, window.innerWidth - 300) }}
                >
                    <input
                        autoFocus
                        className="bg-transparent border-none text-text-light dark:text-gray-200 placeholder-gray-400 text-sm focus:ring-0 p-0 w-full outline-none"
                        placeholder="What needs to be done?"
                        value={createPopover.title}
                        onChange={(e) => setCreatePopover(prev => ({ ...prev, title: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateTask();
                            if (e.key === 'Escape') setCreatePopover({ visible: false, x: 0, y: 0, date: null, title: '' });
                        }}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <span className="material-icons text-primary dark:text-blue-400 text-sm">bolt</span>
                        </div>
                        <button onClick={handleCreateTask} className="bg-gray-100 dark:bg-[#1C2B41] hover:bg-gray-200 dark:hover:bg-gray-700 text-primary dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded border border-border-light dark:border-blue-900/40">
                            Create
                        </button>
                    </div>
                    <button className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-full p-0.5 hover:text-red-500 shadow-sm" onClick={() => setCreatePopover({ visible: false, x: 0, y: 0, date: null, title: '' })}>
                        <span className="material-icons text-xs">close</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
