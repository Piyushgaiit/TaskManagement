import React, { useState } from 'react';

const IssuesView = ({ tasks, onTaskUpdate, currentUser }) => {
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newIssue, setNewIssue] = useState({ problem: '', solution: '' });
    const [editingIssueId, setEditingIssueId] = useState(null); // For editing existing issues
    const [editIssueData, setEditIssueData] = useState({ problem: '', solution: '' });

    // Filter tasks
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

    const handleSaveIssue = async () => {
        if (!selectedTask || !newIssue.problem.trim() || !newIssue.solution.trim()) return;

        const issue = {
            id: Date.now().toString(),
            problem: newIssue.problem,
            solution: newIssue.solution,
            createdBy: currentUser ? currentUser.name : 'Unknown',
            createdAt: new Date().toLocaleString()
        };

        const updatedIssues = [...(selectedTask.issues || []), issue];

        // Optimistic UI update handled by parent via fetch, but locally we might want to clear form immediately
        await onTaskUpdate(selectedTask.id, { issues: updatedIssues });
        setNewIssue({ problem: '', solution: '' });
        setIsCreating(false);
    };

    const handleDeleteIssue = async (issueId) => {
        if (!selectedTask) return;
        if (!window.confirm("Are you sure you want to delete this issue log?")) return;

        const updatedIssues = (selectedTask.issues || []).filter(i => i.id !== issueId);
        await onTaskUpdate(selectedTask.id, { issues: updatedIssues });
    };

    // Start Editing
    const startEditing = (issue) => {
        setEditingIssueId(issue.id);
        setEditIssueData({ problem: issue.problem, solution: issue.solution });
    };

    // Save Edit
    const handleSaveEdit = async () => {
        if (!selectedTask || !editingIssueId) return;

        const updatedIssues = (selectedTask.issues || []).map(issue => {
            if (issue.id === editingIssueId) {
                return {
                    ...issue,
                    problem: editIssueData.problem,
                    solution: editIssueData.solution,
                    // Optionally update timestamp or add 'editedAt'
                };
            }
            return issue;
        });

        await onTaskUpdate(selectedTask.id, { issues: updatedIssues });
        setEditingIssueId(null);
        setEditIssueData({ problem: '', solution: '' });
    };

    return (
        <div className="flex h-full overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Left Sidebar: Task List */}
            <div className="w-1/3 min-w-[300px] border-r border-border-light dark:border-border-dark flex flex-col bg-gray-50 dark:bg-[#1E2125]">
                <div className="p-4 border-b border-border-light dark:border-border-dark">
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-2 top-1.5 text-gray-500 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Search tasks for issues..."
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-surface-dark text-text-light dark:text-text-dark focus:ring-1 focus:ring-primary outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredTasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`p-4 border-b border-border-light dark:border-border-dark cursor-pointer transition-colors hover:bg-white dark:hover:bg-surface-dark ${selectedTaskId === task.id ? 'bg-white dark:bg-surface-dark border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-primary">{task.key}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${task.issues?.length > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                    {task.issues?.length || 0} Issues
                                </span>
                            </div>
                            <div className="text-sm font-medium text-text-light dark:text-text-dark truncate">{task.title}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`px-1.5 py-0.5 text-[10px] rounded ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {task.status}
                                </div>
                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{task.assignee}</span>
                            </div>
                        </div>
                    ))}
                    {filteredTasks.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">No tasks found.</div>
                    )}
                </div>
            </div>

            {/* Right Pane: Issues Detail */}
            <div className="flex-grow flex flex-col overflow-hidden bg-white dark:bg-background-dark">
                {selectedTask ? (
                    <div className="flex flex-col h-full">
                        {/* Task Header */}
                        <div className="p-6 border-b border-border-light dark:border-border-dark flex-shrink-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-bold text-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{selectedTask.key}</span>
                                <h2 className="text-xl font-bold text-text-light dark:text-text-dark truncate">{selectedTask.title}</h2>
                            </div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
                                {selectedTask.description || "No description provided."}
                            </p>
                        </div>

                        {/* Issues List Container */}
                        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-gray-50/50 dark:bg-[#1E2125]/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark flex items-center gap-2">
                                    <span className="material-icons text-red-500">bug_report</span>
                                    Issue Log
                                </h3>
                                {!isCreating && (
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-icons text-base">add</span>
                                        Log New Issue
                                    </button>
                                )}
                            </div>

                            {/* Creation Form */}
                            {isCreating && (
                                <div className="mb-8 bg-white dark:bg-surface-dark border border-primary rounded-lg shadow-md p-4 animate-in fade-in slide-in-from-top-4 duration-200">
                                    <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">New Issue Entry</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Problem Encountered</label>
                                            <textarea
                                                autoFocus
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-[#1c2128] text-sm focus:ring-2 focus:ring-primary/50 outline-none text-text-light dark:text-text-dark"
                                                rows="3"
                                                placeholder="Describe the issue you faced..."
                                                value={newIssue.problem}
                                                onChange={(e) => setNewIssue({ ...newIssue, problem: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Solution / Fix</label>
                                            <textarea
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-[#1c2128] text-sm focus:ring-2 focus:ring-green-500/50 outline-none text-text-light dark:text-text-dark"
                                                rows="3"
                                                placeholder="How did you resolve it?"
                                                value={newIssue.solution}
                                                onChange={(e) => setNewIssue({ ...newIssue, solution: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                onClick={() => { setIsCreating(false); setNewIssue({ problem: '', solution: '' }); }}
                                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveIssue}
                                                disabled={!newIssue.problem.trim() || !newIssue.solution.trim()}
                                                className={`px-4 py-2 text-sm text-white rounded font-medium shadow-sm transition-colors ${!newIssue.problem.trim() || !newIssue.solution.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
                                            >
                                                Save Entry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Existing Issues List */}
                            <div className="space-y-4">
                                {selectedTask.issues && selectedTask.issues.length > 0 ? (
                                    [...selectedTask.issues].reverse().map((issue) => (
                                        <div key={issue.id} className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            {editingIssueId === issue.id ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Edit Problem</label>
                                                        <textarea
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-[#1c2128] text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary/50 outline-none"
                                                            rows="3"
                                                            value={editIssueData.problem}
                                                            onChange={(e) => setEditIssueData({ ...editIssueData, problem: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Edit Solution</label>
                                                        <textarea
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-[#1c2128] text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-green-500/50 outline-none"
                                                            rows="3"
                                                            value={editIssueData.solution}
                                                            onChange={(e) => setEditIssueData({ ...editIssueData, solution: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingIssueId(null)}
                                                            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold">
                                                                {issue.createdBy ? issue.createdBy.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{issue.createdBy}</div>
                                                                <div className="text-[10px] text-gray-500">{issue.createdAt}</div>
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                            <button
                                                                onClick={() => startEditing(issue)}
                                                                className="text-gray-400 hover:text-blue-500"
                                                                title="Edit"
                                                            >
                                                                <span className="material-icons text-sm">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteIssue(issue.id)}
                                                                className="text-gray-400 hover:text-red-500"
                                                                title="Delete"
                                                            >
                                                                <span className="material-icons text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/20">
                                                            <h5 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-1 flex items-center gap-1">
                                                                <span className="material-icons text-sm">error_outline</span> Problem
                                                            </h5>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.problem}</p>
                                                        </div>
                                                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-100 dark:border-green-900/20">
                                                            <h5 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase mb-1 flex items-center gap-1">
                                                                <span className="material-icons text-sm">check_circle_outline</span> Solution
                                                            </h5>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.solution}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 flex flex-col items-center opacity-50">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-icons text-3xl text-gray-400">check_circle</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Issues Logged</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                                            Smooth sailing so far! If you encounter any blockers or bugs, log them here to keep track of solutions.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-[#1c2024]">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/7604/7604068.png"
                            alt="Select Task"
                            className="w-32 h-32 opacity-20 mb-4 grayscale"
                        />
                        <h3 className="text-xl font-medium text-text-secondary-light dark:text-text-secondary-dark">Select a task to view issues</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-md">
                            Choose a task from the list on the left to view its issue log, report new problems, or document solutions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IssuesView;
