const mongoose = require('mongoose');
const Jobs = require('./lib/Models/Job');
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost:27017/daily-video');

// Clear all jobs on startup
Jobs.remove({}, () => {
    console.log('cleared existing jobs');
});

