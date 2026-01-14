import React, { useState } from 'react';
import { PrioritySelect, StatusSelect, DatePicker, AssigneeSelect } from '../ui/TaskEditors';
import ConfirmDialog from '../ui/ConfirmDialog';

const ListView = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete, onTasksDelete, users, currentUser }) => {
    const [inlineCreateValue, setInlineCreateValue] = useState('');
    const [isInlineCreateVisible, setIsInlineCreateVisible] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState(new Set());
    const [creatingSubtaskParentId, setCreatingSubtaskParentId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Helper to handle selection
    const toggleSelection = (id) => {
        const newSet = new Set(selectedTasks);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTasks(newSet);
    };

    const submitNewTask = async () => {
        if (inlineCreateValue.trim()) {
            await onTaskCreate({ title: inlineCreateValue.trim(), parentId: null });
            setInlineCreateValue('');
        }
    };

    const handleCreateSubmit = async (e) => {
        if (e.key === 'Enter') {
            await submitNewTask();
        } else if (e.key === 'Escape') {
            setIsInlineCreateVisible(false);
            setInlineCreateValue('');
        }
    };

    // Group tasks by parent
    const parents = tasks.filter(t => !t.parentId);

    // Sort Logic (Basic for now, can be state-driven later)
    // parents.sort((a,b) => b.id - a.id); 

    return (
        <div id="list-view" className="flex-grow flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="flex items-center justify-between px-6 py-1 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark flex-shrink-0">
                <div className="flex items-center flex-wrap gap-2 md:gap-4">
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-2 top-1 text-gray-500 dark:text-gray-400 text-base">search</span>
                        <input className="pl-8 pr-3 py-1 border border-border-light dark:border-border-dark rounded bg-white dark:bg-surface-dark focus:ring-1 focus:ring-primary outline-none text-xs dark:text-white" placeholder="Search" type="text" />
                    </div>
                    <div className="flex -space-x-1">
                        <div className="w-6 h-6 rounded-full bg-[#1F2E4D] text-white flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-gray-800 z-10">PG</div>
                        <button className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <span className="material-icons text-gray-400 text-[12px]">add</span>
                        </button>
                    </div>
                    {['Epic', 'Type', 'Status', 'Assignee'].map(filter => (
                        <button key={filter} className="px-2 py-1 border border-border-light dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium flex items-center gap-1 transition-colors">
                            {filter} <span className="material-icons-outlined text-sm">expand_more</span>
                        </button>
                    ))}
                    <button className="px-2 py-1 border-none text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-xs font-medium transition-colors">Clear filters</button>
                </div>
            </div>

            {/* Table Container */}
            <div id="list-table-container" className="flex-grow overflow-y-auto custom-scrollbar relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-[#1E2125] sticky top-0 z-10 text-xs text-text-secondary-light dark:text-text-secondary-dark font-semibold tracking-wide border-b border-border-light dark:border-border-dark">
                            <tr>
                                <th className="py-0.5 px-2 w-10 border-r border-border-light dark:border-border-dark text-center">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                                        checked={selectedTasks.size === tasks.length && tasks.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedTasks(new Set(tasks.map(t => t.id)));
                                            else setSelectedTasks(new Set());
                                        }}
                                    />
                                </th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark min-w-[250px]">Key / Title</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-40">Assignee</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-40">Reporter</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-32">Priority</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-32">Status</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-32">Resolution</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-32">Created</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-32">Updated</th>
                                <th className="py-0.5 px-2 border-r border-border-light dark:border-border-dark w-32">Due Date</th>
                                <th className="py-0.5 px-2 text-center w-12 bg-gray-50 dark:bg-[#1E2125] sticky right-0 z-20 border-l border-border-light dark:border-border-dark"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark text-xs bg-white dark:bg-background-dark">
                            {parents.map(parent => (
                                <React.Fragment key={parent.id}>
                                    <TaskRow
                                        task={parent}
                                        isSelected={selectedTasks.has(parent.id)}
                                        onToggleSelect={() => toggleSelection(parent.id)}
                                        onUpdate={onTaskUpdate}
                                        onStartSubtask={() => {
                                            setCreatingSubtaskParentId(parent.id);
                                            if (!parent.expanded) onTaskUpdate(parent.id, { expanded: true });
                                        }}
                                        users={users}
                                        currentUser={currentUser}
                                    />
                                    {!!parent.expanded && tasks.filter(t => t.parentId === parent.id).map(sub => (
                                        <TaskRow
                                            key={sub.id}
                                            task={sub}
                                            isSelected={selectedTasks.has(sub.id)}
                                            onToggleSelect={() => toggleSelection(sub.id)}
                                            onUpdate={onTaskUpdate}
                                            isSubtask
                                            users={users}
                                            currentUser={currentUser}
                                        />
                                    ))}
                                    {creatingSubtaskParentId === parent.id && (
                                        <SubtaskCreateRow
                                            parentId={parent.id}
                                            onCancel={() => setCreatingSubtaskParentId(null)}
                                            onSubmit={onTaskCreate}
                                        />
                                    )}
                                </React.Fragment>
                            ))}

                            {/* Inline Create Row */}
                            <tr id="inline-create-row" className={`${isInlineCreateVisible ? '' : 'hidden'} group bg-blue-50/50 dark:bg-blue-900/10`}>
                                <td className="py-0.5 px-2 border-r border-border-light dark:border-border-dark"></td>
                                <td className="py-0.5 px-2 border-r border-border-light dark:border-border-dark" colSpan="9">
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            className="w-1/2 bg-white dark:bg-surface-dark border-2 border-primary rounded px-2 py-0.5 outline-none text-xs"
                                            placeholder="What needs to be done?"
                                            value={inlineCreateValue}
                                            onChange={(e) => setInlineCreateValue(e.target.value)}
                                            onKeyDown={handleCreateSubmit}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={submitNewTask}
                                                disabled={!inlineCreateValue.trim()}
                                                className={`px-3 py-0.5 rounded font-semibold text-[10px] transition-all ${inlineCreateValue.trim() ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                Create
                                            </button>
                                            <button
                                                onClick={() => { setIsInlineCreateVisible(false); setInlineCreateValue(''); }}
                                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                                title="Cancel"
                                            >
                                                <span className="material-icons text-base">close</span>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-0.5 px-2 border-l border-border-light dark:border-border-dark bg-white dark:bg-background-dark sticky right-0 z-20"></td>
                            </tr>
                            {/* Inline Create Trigger Row */}
                            {!isInlineCreateVisible && (
                                <tr className="hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors cursor-pointer" onClick={() => setIsInlineCreateVisible(true)}>
                                    <td className="py-0.5 px-2 border-r border-border-light dark:border-border-dark text-center">
                                        <span className="material-icons text-gray-400 text-lg">add</span>
                                    </td>
                                    <td colSpan="9" className="py-0.5 px-2 text-xs text-gray-400 font-medium">
                                        Create issue
                                    </td>
                                    <td className="py-0.5 px-2 border-l border-border-light dark:border-border-dark bg-white dark:bg-background-dark sticky right-0 z-20"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <div id="bulk-actions-bar" className={selectedTasks.size > 0 ? 'active' : ''}>
                <div className="selection-count-badge">{selectedTasks.size}</div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">selected</span>
                <div className="bulk-action-divider"></div>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bulk-action-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                    <span className="material-icons text-lg">delete</span>
                    Delete
                </button>
                <div className="bulk-action-divider"></div>
                <button
                    onClick={() => setSelectedTasks(new Set())}
                    className="bulk-action-btn"
                >
                    <span className="material-icons text-lg">close</span>
                    Cancel
                </button>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    onTasksDelete(selectedTasks);
                    setSelectedTasks(new Set());
                }}
                title="Delete Tasks"
                message={`Are you sure you want to delete ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}? This action cannot be undone.`}
                confirmText="Yes"
                cancelText="No"
            />
        </div>
    );
};

const SubtaskCreateRow = ({ parentId, onCancel, onSubmit }) => {
    const [value, setValue] = useState('');

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter' && value.trim()) {
            await onSubmit({ title: value.trim(), parentId });
            setValue('');
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <tr className="bg-white dark:bg-background-dark">
            <td className="py-1 px-2 border-r border-border-light dark:border-border-dark"></td>
            <td colSpan="9" className="py-0.5 px-2 border-r border-border-light dark:border-border-dark">
                <div className="w-1/2 border-2 border-primary rounded ml-6 p-0.5 flex items-center gap-2 bg-white dark:bg-background-dark shadow-sm">
                    <div className="flex items-center gap-1 text-primary">
                        <span className="material-icons text-base">check_box</span>
                        <span className="material-icons text-sm">expand_more</span>
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="What needs to be done?"
                        className="flex-grow bg-transparent border-none focus:ring-0 text-xs py-0.5 placeholder-gray-400 dark:text-text-dark outline-none"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-2 pr-2">
                        <button
                            onClick={() => { if (value.trim()) { onSubmit({ title: value.trim(), parentId }); setValue(''); } }}
                            className={`px-3 py-0.5 rounded font-semibold text-[10px] transition-colors ${value.trim() ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-gray-100 text-gray-400'}`}
                            disabled={!value.trim()}
                        >
                            Create
                        </button>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                            <span className="material-icons text-base">close</span>
                        </button>
                    </div>
                </div>
            </td>
            <td className="py-1 px-2 border-l border-border-light dark:border-border-dark bg-white dark:bg-background-dark sticky right-0 z-20"></td>
        </tr>
    );
};

// Task Row Component
const TaskRow = ({ task, isSelected, onToggleSelect, onUpdate, isSubtask, onStartSubtask, users, currentUser }) => {

    // Handlers using the new Components
    const handlePriorityUpdate = (newPriority) => {
        onUpdate(task.id, {
            priority: newPriority,
            updated: new Date().toLocaleString()
        });
    };

    const handleAssigneeUpdate = (newAssignee) => {
        onUpdate(task.id, {
            assignee: newAssignee,
            updated: new Date().toLocaleString()
        });
    };

    const handleStatusUpdate = (newStatus) => {
        if (newStatus === task.status) return;
        const isDone = newStatus === 'DONE';
        const newResolution = isDone ? 'Done' : 'Unresolved';
        onUpdate(task.id, {
            status: newStatus,
            resolution: newResolution,
            updated: new Date().toLocaleString()
        });
    };

    const handleDateUpdate = (newDate) => {
        onUpdate(task.id, {
            dueDate: newDate,
            updated: new Date().toLocaleString()
        });
    };

    return (
        <tr className={`group hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors ${isSelected ? 'row-selected' : ''} ${isSubtask ? 'subtask-row' : ''}`}>
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-center">
                <input
                    type="checkbox"
                    className={`w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary ${isSubtask ? 'ml-6' : ''}`}
                    checked={isSelected}
                    onChange={onToggleSelect}
                />
            </td>
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark">
                <div className={`flex items-center justify-between group/work ${isSubtask ? 'ml-6' : ''}`}>
                    <div className="flex items-center gap-2 min-w-0">
                        {!isSubtask && (
                            <span
                                onClick={() => onUpdate(task.id, { expanded: !task.expanded })}
                                className="material-icons text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-transform duration-200 text-base"
                            >
                                {task.expanded ? 'expand_more' : 'chevron_right'}
                            </span>
                        )}
                        <div className={`p-0.5 ${isSubtask ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'} rounded flex items-center justify-center`}>
                            <span className={`material-icons ${isSubtask ? 'text-blue-600 text-[12px]' : 'text-purple-600 text-[10px] font-bold'}`}>
                                {isSubtask ? 'check_box' : 'bolt'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 text-xs">
                            <a className="text-primary hover:underline font-medium decoration-primary underline-offset-2" href="#">{task.key}</a>
                            <span className="text-text-light dark:text-text-dark truncate">{task.title}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/work:opacity-100 transition-opacity">
                        {!isSubtask && (
                            <button
                                onClick={onStartSubtask}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="Add subtask"
                            >
                                <span className="material-icons text-lg">add</span>
                            </button>
                        )}
                    </div>
                </div>
            </td>
            {/* Assignee */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300">
                <AssigneeSelect
                    assignee={task.assignee}
                    users={users}
                    onUpdate={handleAssigneeUpdate}
                    currentUser={currentUser}
                />
            </td>
            {/* Reporter */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#1F2E4D] text-white flex items-center justify-center text-[9px] font-bold">PG</div>
                    <span className="text-[12px]">{task.reporter}</span>
                </div>
            </td>
            {/* Priority */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300">
                <PrioritySelect priority={task.priority} onUpdate={handlePriorityUpdate} />
            </td>
            {/* Status */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark">
                <StatusSelect status={task.status} onUpdate={handleStatusUpdate} />
            </td>
            {/* Resolution */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 whitespace-nowrap text-[12px]">
                {task.resolution}
            </td>
            {/* Created */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 whitespace-nowrap text-[12px]">
                {task.created}
            </td>
            {/* Updated */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 whitespace-nowrap text-[12px]">
                {task.updated}
            </td>
            {/* Due Date */}
            <td className="py-0.5 px-2 align-middle border-r border-border-light dark:border-border-dark whitespace-nowrap text-[12px]">
                <DatePicker
                    dateStr={task.dueDate}
                    onUpdate={handleDateUpdate}
                    creationDateStr={task.created}
                />
            </td>
            {/* Options */}
            <td className="py-0.5 px-2 align-middle text-center bg-white dark:bg-background-dark sticky right-0 z-20 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors border-l border-border-light dark:border-border-dark">
                <span className="material-icons-outlined text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer text-base">more_horiz</span>
            </td>
        </tr>
    );
}

export default ListView;
