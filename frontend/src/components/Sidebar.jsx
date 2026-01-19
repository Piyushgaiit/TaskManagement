import React from 'react';

const Sidebar = ({ projects = [], activeProjectId, onProjectSelect, onViewChange, currentView, isOpen = true, user, onProjectDelete }) => {
    if (!isOpen) return null;

    return (
        <aside className="w-64 bg-sidebar-light dark:bg-sidebar-dark flex-shrink-0 border-r border-border-light dark:border-border-dark flex flex-col py-6 overflow-y-auto hidden md:flex transition-colors duration-200">
            <div className="px-4 mb-2">
                <div
                    onClick={() => onViewChange && onViewChange('forYou')}
                    className={`flex items-center gap-3 py-2 px-2 rounded cursor-pointer transition-colors ${currentView === 'forYou' ? 'bg-selection-blue-light dark:bg-selection-blue-dark text-primary font-medium' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark'}`}
                >
                    <span className="material-icons-outlined text-xl">account_circle</span>
                    <span className="font-medium">For you</span>
                </div>


                <div
                    onClick={() => onViewChange && onViewChange('users')}
                    className={`flex items-center gap-3 py-2 px-2 rounded cursor-pointer transition-colors ${currentView === 'users' ? 'bg-selection-blue-light dark:bg-selection-blue-dark text-primary font-medium' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark'}`}
                >
                    <span className="material-icons-outlined text-xl">group</span>
                    <span className="font-medium">People</span>
                </div>

            </div>

            {/* Dynamic Project List */}
            <div className="mt-2 px-4">
                <div className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide px-2 mb-1">
                    Projects</div>

                {projects.map((project, index) => {
                    const isActive = project.id === activeProjectId && currentView === 'project';
                    return (
                        <div
                            key={project.id}
                            className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors group/item ${isActive ? 'bg-selection-blue-light dark:bg-selection-blue-dark text-primary border-l-4 border-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-text-light dark:text-text-dark border-l-4 border-transparent'}`}
                        >
                            <div
                                onClick={() => {
                                    onProjectSelect && onProjectSelect(project.id);
                                    onViewChange && onViewChange('project');
                                }}
                                className="flex flex-grow items-center gap-3 overflow-hidden"
                            >
                                <div className="p-1 rounded-sm flex-shrink-0" style={{ backgroundColor: project.iconColor || '#1F2E4D' }}>
                                    <span className="material-icons text-white text-xs">
                                        {project.type === 'Business' ? 'folder' : 'rocket_launch'}
                                    </span>
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`font-medium truncate ${isActive ? 'text-primary' : ''}`}>{project.name}</span>
                                    <span className="text-[10px] uppercase opacity-70">{project.type} project</span>
                                </div>
                            </div>

                            {/* Delete Button - Only for TMA Admin */}
                            {user && user.role === 'TMA' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onProjectDelete && onProjectDelete(project.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    title="Delete Project"
                                >
                                    <span className="material-icons text-sm">delete</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>


        </aside>
    );
};

export default Sidebar;
