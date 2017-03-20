const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  slideshowId: String,
  slides: Array
});

// schema.method('custom method', function () {
//   console.log('foo');
// });

module.exports = mongoose.model('Project', schema);