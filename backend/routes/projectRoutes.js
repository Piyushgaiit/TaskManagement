const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject } = require('../controllers/projectController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getProjects);
router.post('/', protect, createProject);
router.delete('/:id', protect, admin, deleteProject);

module.exports = router;
