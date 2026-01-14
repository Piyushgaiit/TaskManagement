const mongoose = require('mongoose');

const toJSONConfig = {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    }
};

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true },
    type: { type: String },
    lead: { type: String },
    iconColor: { type: String }
});

ProjectSchema.set('toJSON', toJSONConfig);

module.exports = mongoose.model('Project', ProjectSchema);
