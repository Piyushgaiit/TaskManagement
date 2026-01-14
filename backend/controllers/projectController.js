const Project = require('../models/Project');
const asyncHandler = require('../middlewares/asyncHandler');
const { createNotification } = require('../services/notificationService');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find().sort({ _id: -1 });
    res.json({ message: "success", projects });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { name, key, type, lead, iconColor, creator } = req.body;
    const project = await Project.create({ name, key, type, lead, iconColor });

    const createdBy = creator || lead || 'Unknown';
    const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Global notification
    createNotification(`New project '${name}' created by ${createdBy} on ${date}`, 'project_created');

    res.json({ message: "success", id: project.id });
});

const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

module.exports = {
    getProjects,
    createProject,
    deleteProject
};
