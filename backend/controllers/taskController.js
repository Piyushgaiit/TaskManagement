const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { createNotification } = require('../services/notificationService');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    const query = {};
    if (projectId) {
        query.projectId = projectId;
    }

    const tasks = await Task.find(query).sort({ _id: 1 });
    res.json({ message: "success", tasks });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { key, title, description, assignee, reporter, priority, status, resolution, created, updated, startDate, dueDate, parentId, projectId } = req.body;

    const newTask = await Task.create({
        key,
        title,
        description,
        assignee,
        reporter,
        priority,
        status,
        resolution,
        created,
        updated,
        startDate,
        dueDate,
        parentId: parentId || null,
        projectId
    });

    const project = await Project.findById(projectId);
    const projectName = project ? project.name : 'Unknown Project';
    const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    createNotification(`Project '${projectName}': New work (${key}) '${title}' added by ${reporter} on ${date}`, 'work_added');
    res.json({ message: "success", id: newTask.id });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const updates = req.body;

    const oldTask = await Task.findById(taskId);
    if (!oldTask) {
        res.status(404);
        throw new Error('Task not found');
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    const project = await Project.findById(oldTask.projectId);
    const projectName = project ? project.name : 'Unknown Project';
    const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Check for completion
    if (updates.status === 'DONE' && oldTask.status !== 'DONE') {
        const completedBy = updates.modifiedBy || 'Unknown';
        createNotification(`Project '${projectName}': Work '${updatedTask.title}' is completed by ${completedBy} on ${date}`, 'work_completed');
    }

    // Check for assignee change (Targeted Notification)
    if (updates.assignee && updates.assignee !== oldTask.assignee && updates.assignee !== 'Unassigned') {
        const assignedBy = updates.modifiedBy || 'System';
        const modifierId = updates.modifierId;

        let recipientIds = [];

        // 1. Add the Admin (Modifier)
        if (modifierId) recipientIds.push(modifierId);

        // 2. Add the Assignee
        const assigneeUser = await User.findOne({ name: updates.assignee });
        if (assigneeUser) {
            recipientIds.push(assigneeUser.id);
        }

        recipientIds = [...new Set(recipientIds)];

        if (recipientIds.length > 0) {
            createNotification(
                `Project '${projectName}': Task '${updatedTask.title}' has been assigned to ${updates.assignee} by ${assignedBy} on ${date}`,
                'assignment',
                recipientIds
            );
        }
    }

    res.json({ message: "success", changes: 1 });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    const deletedBy = req.query.deletedBy || 'Unknown';

    if (task) {
        await Task.findByIdAndDelete(taskId);

        const project = await Project.findById(task.projectId);
        const projectName = project ? project.name : 'Unknown Project';
        const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        createNotification(`Project '${projectName}': Work '${task.title}' deleted by ${deletedBy} on ${date}`, 'work_deleted');
        res.json({ message: "deleted", changes: 1 });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
