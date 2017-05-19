const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    theme: String,
    slide: Object
}, { minimize: false });

module.exports = mongoose.model('Preview', schema);
