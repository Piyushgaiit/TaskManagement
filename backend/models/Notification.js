const mongoose = require('mongoose');

const toJSONConfig = {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    }
};

const NotificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, required: true },
    isRead: { type: Number, default: 0 },
    recipientIds: [{ type: String }], // Array of user IDs. Empty/Null means everyone.
    created_at: { type: String, default: () => new Date().toISOString() }
});

NotificationSchema.set('toJSON', toJSONConfig);

module.exports = mongoose.model('Notification', NotificationSchema);
