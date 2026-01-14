const Notification = require('../models/Notification');
const Task = require('../models/Task');
const asyncHandler = require('../middlewares/asyncHandler');
const { createNotification } = require('../services/notificationService');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.query.userId;

    // Check for overdue tasks logic
    const now = new Date().toISOString();
    const overdueTasks = await Task.find({
        status: { $nin: ['DONE', 'Done'] },
        dueDate: { $lt: now }
    }).select('key title');

    for (const task of overdueTasks) {
        const msg = `Task ${task.key}: "${task.title}" is overdue`;
        const exists = await Notification.exists({ message: msg, type: 'due' });
        if (!exists) {
            await createNotification(msg, 'due'); // Global due date for now, can be improved to target assignee
        }
    }

    let query = {};
    if (userId) {
        query = {
            $or: [
                { recipientIds: userId },
                { recipientIds: { $exists: false } },
                { recipientIds: [] },
                { recipientIds: null }
            ]
        };
    }

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: 0 });
    const notifications = await Notification.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        unreadCount
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: 1 });
    res.json({ message: "marked as read" });
});

module.exports = {
    getNotifications,
    markAsRead
};
