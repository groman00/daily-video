const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  slide: Object
});

module.exports = mongoose.model('Preview', schema);
