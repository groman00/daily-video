const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  theme: String,
  slide: Object
});

module.exports = mongoose.model('Preview', schema);
