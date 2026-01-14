import React, { useState } from 'react';

const BoardView = ({ tasks, onTaskUpdate }) => {

    // Drag and Drop Logic
    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('text/plain', taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const task = tasks.find(t => t.id === taskId);

        if (task && task.status !== newStatus) {
            // Determine resolution
            const isDone = newStatus === 'DONE';
            const newResolution = isDone ? 'Done' : 'Unresolved';

            // Call update handler
            await onTaskUpdate(taskId, {
                status: newStatus,
                resolution: newResolution,
                updated: new Date().toLocaleString()
            });
        }
    };

    const renderColumn = (status, title) => {
        const filteredTasks = tasks.filter(t => t.status === status).sort((a, b) => b.id - a.id);

        return (
            <div className="min-w-[280px] w-[280px] bg-surface-light dark:bg-surface-dark rounded-md p-3 flex flex-col gap-2 h-full max-h-full">
                <div className="flex items-center justify-between px-1 mb-1">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                        {title}
                        <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] text-gray-700 dark:text-gray-300">
                            {filteredTasks.length}
                        </span>
                    </h3>
                </div>

                <div
                    className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[50px] flex flex-col gap-2 pb-2"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    {filteredTasks.map(task => {
                        const parent = task.parentId ? tasks.find(t => t.id === task.parentId) : null;
                        const isSubtask = !!task.parentId;

                        // Priority Styles
                        let pIcon = 'drag_handle', pColor = 'text-orange-400';
                        if (task.priority === 'Highest') { pIcon = 'keyboard_double_arrow_up'; pColor = 'text-red-600'; }
                        if (task.priority === 'High') { pIcon = 'expand_less'; pColor = 'text-red-500'; }
                        if (task.priority === 'Low') { pIcon = 'expand_more'; pColor = 'text-blue-500'; }
                        if (task.priority === 'Lowest') { pIcon = 'keyboard_double_arrow_down'; pColor = 'text-blue-600'; }

                        return (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                className="bg-white dark:bg-[#22272b] p-3 rounded-md shadow-sm border border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{task.title}</h4>
                                    <span className="material-icons-outlined text-gray-400 opacity-0 group-hover:opacity-100 text-sm">more_horiz</span>
                                </div>
                                {parent && (
                                    <div className="mb-2">
                                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase truncate block max-w-full">
                                            {parent.title}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`${isSubtask ? 'text-blue-500' : 'text-purple-600'} flex items-center`}>
                                            <span className="material-icons text-[16px]">{isSubtask ? 'check_box' : 'bolt'}</span>
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{task.key}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`material-icons ${pColor} text-[18px]`}>{pIcon}</span>
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-white dark:border-background-dark">
                                            <span className="material-icons-outlined text-gray-500 text-[14px]">person</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors group flex-shrink-0 mt-1">
                    <span className="material-icons-outlined text-xl group-hover:text-gray-800 dark:group-hover:text-gray-100">add</span>
                    <span className="text-sm font-medium group-hover:text-gray-800 dark:group-hover:text-gray-100">Create</span>
                </button>
            </div>
        );
    };

    return (
        <div id="board-view" className="flex-grow flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-light dark:border-border-dark flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-1">
                        <div className="w-8 h-8 rounded-full bg-[#1F2E4D] text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-800 z-10">PG</div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800">
                            <span className="material-icons text-gray-500 text-lg">person_add</span>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-2 top-1.5 text-gray-500 dark:text-gray-400 text-lg">search</span>
                        <input className="pl-9 pr-3 py-1.5 border border-border-light dark:border-border-dark rounded bg-white dark:bg-surface-dark focus:ring-1 focus:ring-primary outline-none text-sm dark:text-white" placeholder="Search board" type="text" />
                    </div>
                    <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-text-light dark:text-text-dark font-medium transition-colors text-sm">GroupBy: None</button>
                </div>
            </div>

            <div className="flex-grow overflow-x-auto overflow-y-hidden custom-scrollbar p-6">
                <div className="flex h-full gap-4">
                    {renderColumn('TO DO', 'To Do')}
                    {renderColumn('IN PROGRESS', 'In Progress')}
                    {renderColumn('DONE', 'Done')}

                    {/* Add Column Button */}
                    <button className="min-w-[40px] w-[40px] h-[40px] flex items-center justify-center border border-border-light dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm shrink-0">
                        <span className="material-icons-outlined text-gray-600 dark:text-gray-300 text-xl">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BoardView;
