const Jobs = require('./Jobs');



var activeJobs = new Jobs();
activeJobs.connect()
  .then(() => {
    console.log('connection successful');
    activeJobs.hasActive()
      .then((bool) => {
        console.log('Active Jobs?', bool);
      });
  })
  .catch((e) => {
    console.log('mongo connection error', e);
  });



/*
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/daily-video';

// Use connect method to connect to the server
MongoClient.connect(url, (err, db) => {
  let jobs;
  assert.equal(err, null);

  jobs = db.collection('jobs');
  jobs.find({}).toArray(function(e, docs) {
    assert.equal(e, null);

    console.log("Found the following records");
    console.log(docs)

  });

  db.close();
});
*/