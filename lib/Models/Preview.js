const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    theme: String,
    slide: Object,
    format: String
}, { minimize: false });

module.exports = mongoose.model('Preview', schema);
