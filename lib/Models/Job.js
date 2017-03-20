const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    timestamp: {
        type : Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', schema);