const Notification = require('../models/Notification');

const createNotification = async (message, type, recipientIds = null) => {
    try {
        await Notification.create({
            message,
            type,
            created_at: new Date().toISOString(),
            recipientIds: recipientIds
        });
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

module.exports = {
    createNotification
};
