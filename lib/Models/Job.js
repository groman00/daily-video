const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    timestamp: {
        type : Date,
        default: Date.now
    },
    projectId: Schema.Types.ObjectId,
    socketId: String,
});

module.exports = mongoose.model('Job', schema);