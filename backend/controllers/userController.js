const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../middlewares/asyncHandler');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with due task count)
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    const usersData = await User.find().sort({ name: 1 });
    const now = new Date().toISOString();

    const usersWithDue = await Promise.all(usersData.map(async (user) => {
        const dueCount = await Task.countDocuments({
            assignee: user.name,
            status: { $nin: ['DONE', 'Done'] },
            dueDate: { $lt: now }
        });
        return { ...user.toJSON(), dueCount };
    }));

    res.json({ message: "success", users: usersWithDue });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({ message: "success", user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const { name, avatarUrl, password, role, requesterId } = req.body;
    const userId = req.params.id;

    // Security check for role updates
    if (role) {
        if (!requesterId) {
            res.status(403);
            throw new Error('Requester ID required for role update');
        }
        const requester = await User.findById(requesterId);
        if (!requester || requester.role !== 'TMA') {
            res.status(403);
            throw new Error('Only admin (TMA) can change roles');
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                ...(name && { name }),
                ...(avatarUrl && { avatarUrl }),
                ...(password && { password: await bcrypt.hash(password, 10) }),
                ...(role && { role })
            }
        },
        { new: true }
    );

    if (!updatedUser) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({ message: "success", user: updatedUser });
});

module.exports = {
    getUsers,
    getUserById,
    updateUser
};
