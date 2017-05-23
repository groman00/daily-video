const mongoose = require('mongoose');
const Jobs = require('./lib/Models/Job');
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_DB_CONNECTION);

// Clear all jobs on startup
Jobs.remove({}, () => {
    console.log('cleared existing jobs');
});

