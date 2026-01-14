import React, { useMemo } from 'react';

const SummaryView = ({ tasks }) => {
    // 1. Calculate Stats
    const stats = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

        const parseDate = (dateStr) => {
            if (!dateStr || dateStr === 'None') return null;
            const parts = dateStr.split(', ');
            if (parts.length < 2) return new Date(dateStr);
            return new Date(parts[0] + ', ' + parts[1]);
        };

        const completed = tasks.filter(t => t.status === 'DONE' && parseDate(t.updated) >= sevenDaysAgo).length;
        const updated = tasks.filter(t => parseDate(t.updated) >= sevenDaysAgo).length;
        const created = tasks.filter(t => parseDate(t.created) >= sevenDaysAgo).length;
        const dueSoon = tasks.filter(t => t.dueDate && t.dueDate !== 'None' && parseDate(t.dueDate) >= now && parseDate(t.dueDate) <= sevenDaysFromNow).length;

        // Status Counts
        const statusCounts = {};
        tasks.forEach(t => {
            statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
        });

        // Priority Counts
        const priorityCounts = { 'Highest': 0, 'High': 0, 'Medium': 0, 'Low': 0, 'Lowest': 0 };
        tasks.forEach(t => {
            const p = t.priority || 'Medium';
            priorityCounts[p] = (priorityCounts[p] || 0) + 1;
        });
        const maxPriority = Math.max(...Object.values(priorityCounts), 1);

        // Types
        const types = { 'Epic': 0, 'Task': 0, 'Subtask': 0 };
        tasks.forEach(t => {
            if (t.parentId) types['Subtask']++;
            else if (tasks.some(child => child.parentId === t.id)) types['Epic']++;
            else types['Task']++;
        });

        // Workload
        const assigneeStats = {};
        tasks.forEach(t => {
            const a = t.assignee || 'Unassigned';
            assigneeStats[a] = (assigneeStats[a] || 0) + 1;
        });

        return { completed, updated, created, dueSoon, statusCounts, priorityCounts, maxPriority, types, assigneeStats };
    }, [tasks]);

    // Donut Gradient Logic
    const donutGradient = useMemo(() => {
        if (tasks.length === 0) return '#e5e7eb';
        const colorMap = { 'TO DO': '#7cb342', 'IN PROGRESS': '#3b82f6', 'DONE': '#10b981' };
        let cumulative = 0;
        const stops = Object.keys(stats.statusCounts).map(status => {
            const count = stats.statusCounts[status];
            const percent = (count / tasks.length) * 100;
            const start = cumulative;
            cumulative += percent;
            return `${colorMap[status] || '#8c9096'} ${start}% ${cumulative}%`;
        });
        return `conic-gradient(${stops.join(', ')})`;
    }, [tasks, stats.statusCounts]);

    return (
        <div id="summary-view" className="flex-grow flex flex-col overflow-y-auto overflow-x-hidden p-6 gap-6 bg-background-light dark:bg-background-dark custom-scrollbar">

            {/* Top Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Completed', count: stats.completed, suffix: 'completed', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Updated', count: stats.updated, suffix: 'updated', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Created', count: stats.created, suffix: 'created', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Due Soon', count: stats.dueSoon, suffix: 'due soon', color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-[#22272b] p-4 rounded-lg shadow-sm border border-border-light dark:border-border-dark flex flex-col items-center justify-center h-24">
                        <span className={`text-2xl font-bold ${card.color} dark:${card.color.replace('600', '400')}`}>{card.count}</span>
                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 uppercase tracking-wide font-semibold text-[10px]">{card.suffix}</span>
                        <div className={`mt-2 h-1 w-16 rounded-full ${card.bg} dark:bg-opacity-20`}>
                            <div className={`h-full rounded-full ${card.bg.replace('50', '500')}`} style={{ width: '60%' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Status Overview */}
                <div className="col-span-8 bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-6">Status Overview</h3>
                    <div className="flex items-center justify-around">
                        <div className="donut-chart" style={{ background: donutGradient }}>
                            <div className="donut-hole bg-white dark:bg-[#22272b]">
                                <span className="text-3xl font-bold text-text-light dark:text-text-dark">{tasks.length}</span>
                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase font-semibold">Total Issues</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {Object.entries(stats.statusCounts).map(([status, count]) => (
                                <div key={status} className="flex items-center">
                                    <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: status === 'TO DO' ? '#7cb342' : status === 'IN PROGRESS' ? '#3b82f6' : '#10b981' }}></span>
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">{status}: <span className="font-bold">{count}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-4 bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6 flex flex-col h-[320px]">
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Recent Activity</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {tasks.length === 0 && <div className="text-center py-10 text-gray-400 text-sm italic">No recent activity</div>}
                        {tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="flex items-start space-x-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {task.assignee === 'Unassigned' ? '?' : task.assignee.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">{task.assignee}</span> updated <span className="inline-flex items-center gap-1 border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-1 rounded text-blue-600 dark:text-blue-400 text-xs">{task.key}</span>
                                    </p>
                                    <div className="mt-1">
                                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{task.status}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">{task.updated}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Priority Breakdown */}
                <div className="bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-6">Priority Breakdown</h3>
                    <div className="flex items-end justify-between h-40 px-4">
                        {['Highest', 'High', 'Medium', 'Low', 'Lowest'].map(p => {
                            const count = stats.priorityCounts[p] || 0;
                            const height = (count / stats.maxPriority) * 100;
                            return (
                                <div key={p} className="w-1/5 flex flex-col items-center justify-end h-full gap-2 group">
                                    <div className="text-xs font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{count}</div>
                                    <div className="w-10 bg-[#8c9096] dark:bg-gray-600 rounded-t-sm transition-all duration-500 hover:bg-primary" style={{ height: `${height}%` }}></div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">{p}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Types of Work */}
                <div className="bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-6">Types of Work</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.types).map(([type, count]) => {
                            const percent = (count / tasks.length) * 100 || 0;
                            const icon = type === 'Epic' ? 'bolt' : type === 'Task' ? 'check_box' : 'subdirectory_arrow_right';
                            const color = type === 'Epic' ? 'text-purple-400' : 'text-blue-500';
                            return (
                                <div key={type} className="grid grid-cols-12 items-center">
                                    <div className="col-span-4 flex items-center text-sm text-gray-700 dark:text-gray-200">
                                        <span className={`material-icons ${color} mr-2 text-lg`}>{icon}</span> {type}
                                    </div>
                                    <div className="col-span-8">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-sm h-6 flex overflow-hidden relative">
                                            <div className="bg-[#8c9096] h-full flex items-center pl-2 text-xs text-white font-medium transition-all duration-500" style={{ width: `${percent}%` }}>
                                                {percent >= 10 && `${percent.toFixed(0)}%`}
                                            </div>
                                            {percent < 10 && count > 0 && <span className="absolute left-2 top-1 text-xs text-gray-600 font-medium">{percent.toFixed(0)}%</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryView;
