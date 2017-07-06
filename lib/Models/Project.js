const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    type: { type: String, default: 'project'},
    theme: String,
    format: String,
    title: String,
    slideshowId: String,
    narration: { type: Object, default: {} },
    slides: Array,
    audioTrack: String,
    audioTrackLevel: Number,
    videoDuration: Number,
    preview: Boolean
}, { minimize: false });

module.exports = mongoose.model('Project', schema);
