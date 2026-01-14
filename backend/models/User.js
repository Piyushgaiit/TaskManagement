const mongoose = require('mongoose');

const toJSONConfig = {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    }
};

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    avatarColor: { type: String },
    role: { type: String, default: 'User' },
    avatarUrl: { type: String },
    lastLogin: { type: String },
    lastLogout: { type: String }
});

UserSchema.set('toJSON', toJSONConfig);

module.exports = mongoose.model('User', UserSchema);
