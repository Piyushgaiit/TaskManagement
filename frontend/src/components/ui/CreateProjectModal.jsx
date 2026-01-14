import React, { useState } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [type, setType] = useState('Software');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && key) {
            onCreate({
                name,
                key: key.toUpperCase(),
                type,
                lead: 'Piyush Gaygole', // Hardcoded current user
                iconColor: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
            });
            setName('');
            setKey('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1d2125] w-[500px] rounded-md shadow-2xl border border-border-light dark:border-border-dark flex flex-col">
                <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Create project</h2>
                    <button onClick={onClose} className="text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                        <span className="material-icons text-xl">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-[#22272b] rounded px-2 py-1.5 text-sm focus:border-primary focus:bg-white dark:focus:border-primary outline-none transition-colors dark:text-text-dark"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                // Auto-generate key
                                if (!key) {
                                    setKey(e.target.value.substring(0, 3).toUpperCase());
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark mb-1">
                            Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-32 border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-[#22272b] rounded px-2 py-1.5 text-sm focus:border-primary focus:bg-white dark:focus:border-primary outline-none transition-colors uppercase dark:text-text-dark"
                            value={key}
                            onChange={(e) => setKey(e.target.value.toUpperCase())}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark mb-1">
                            Template
                        </label>
                        <select
                            className="w-full border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-[#22272b] rounded px-2 py-1.5 text-sm focus:border-primary outline-none dark:text-text-dark"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Software">Kanban (Software)</option>
                            <option value="Business">Task Tracking (Business)</option>
                        </select>
                    </div>
                </form>

                <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-end gap-2 bg-gray-50 dark:bg-[#22272b] rounded-b-md">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-text-light dark:text-text-dark transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name || !key}
                        className={`px-3 py-1.5 text-sm font-medium rounded text-white transition-colors ${name && key ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                    >
                        Create project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectModal;
