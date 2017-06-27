const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    theme: String,
    format: String,
    title: String,
    slideshowId: String,
    slideshowData: Object,
    slides: Array,
    // narrationTrack: String,
    // narrationTrackLevel: Number,
    audioTrack: String,
    audioTrackLevel: Number,
    videoDuration: Number,
    preview: Boolean
}, { minimize: false });

// schema.method('custom method', function () {
//   console.log('foo');
// });

module.exports = mongoose.model('Project', schema);