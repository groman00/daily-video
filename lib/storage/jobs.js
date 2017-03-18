const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');
// assert.equal(err, null);

// https://docs.mongodb.com/v3.2/tutorial/expire-data/

// todo: better error handling.

class Jobs {
  constructor() {
    this.url = 'mongodb://localhost:27017/daily-video';
    this.db = undefined;
    this.jobs = undefined;
  }
  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, (e, db) => {
        if (e) {
          reject(e);
          return;
        }
        this.db = db;
        this.jobs = db.collection('jobs');
        this.db.close();
        resolve();
      });
    });
  }
  hasActive() {
    return new Promise((resolve, reject) => {
      this.db.open((dbErr, db) => {
        if (dbErr) {
          reject(dbErr);
          return;
        }
        this.jobs.find({}).toArray((e, docs) => {
          if (e) {
            reject(e);
            return;
          }
          resolve(!!docs.length);
          db.close();
        });
      });
    });
  }
}

module.exports = Jobs;