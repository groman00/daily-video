const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  slideshowId: String,
  slides: Array
});

module.exports = mongoose.model('Project', schema);