const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  theme: String,
  title: String,
  slideshowId: String,
  slides: Array,
  narrationTrack: String,
  narrationTrackLevel: Number,
  audioTrack: String,
  audioTrackLevel: Number,
  videoDuration: Number,
  preview: Boolean
});

// schema.method('custom method', function () {
//   console.log('foo');
// });

module.exports = mongoose.model('Project', schema);