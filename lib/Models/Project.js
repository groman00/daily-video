const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name: String
});

module.exports = mongoose.model('Project', schema);