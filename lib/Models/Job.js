const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    timestamp: {
        type : Date,
        default: Date.now
    },
    projectId: {
        type : Schema.Types.ObjectId,
        default: null
    },
    socketId: String,
});

module.exports = mongoose.model('Job', schema);