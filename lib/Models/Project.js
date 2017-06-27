const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    theme: String,
    format: String,
    title: String,
    slideshowId: String,
    narration: Object,
    slides: Array,
    audioTrack: String,
    audioTrackLevel: Number,
    videoDuration: Number,
    preview: Boolean
}, { minimize: false });

module.exports = mongoose.model('Project', schema);
