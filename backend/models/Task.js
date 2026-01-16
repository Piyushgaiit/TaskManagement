const mongoose = require('mongoose');

const toJSONConfig = {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    }
};

const TaskSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    assignee: { type: String },
    reporter: { type: String },
    priority: { type: String },
    status: { type: String },
    resolution: { type: String },
    created: { type: String },
    updated: { type: String },
    startDate: { type: String },
    dueDate: { type: String },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    expanded: { type: Number, default: 1 },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    issues: [{
        id: String,
        problem: String,
        solution: String,
        createdBy: String,
        createdAt: String
    }]
});

TaskSchema.set('toJSON', toJSONConfig);

module.exports = mongoose.model('Task', TaskSchema);
