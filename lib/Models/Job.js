const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    type: String,
    timestamp: {
        type : Date,
        default: Date.now
    },
    projectId: {
        type : Schema.Types.ObjectId,
        default: null
    },
    previewId: {
        type : Schema.Types.ObjectId,
        default: null
    },
    socketId: String,
});

module.exports = mongoose.model('Job', schema);