const fs = require('fs');
const del = require('del');
const helpers = require('./helpers');
const jobsFile = __dirname + '/../resources/json/jobs.json';

function getJobs() {
  return new Promise((resolve, reject) => {
    fs.readFile(jobsFile, (err, data) => {
      if (err) {
        reject();
        return false;
      }
      resolve(JSON.parse(data));
    });
  });
}

function writeJobs(jobs, callback) {
    helpers.writeFile(jobsFile, jobs, callback);
}

module.exports.queue = function(id, callback) {
  getJobs()
    .then((jobs) => {
      jobs.activeJobs.push(id);
      writeJobs(jobs, callback);
    })
    .catch((e) => {
      callback(e);
    });
}

module.exports.clearJob = function(dir, name) {
  // Remove job from jobs file
  getJobs()
    .then((jobs) => {
      jobs.activeJobs = jobs.activeJobs.filter((job) => {
        return job !== name;
      });
      writeJobs(jobs, Function.prototype);
    })
    .catch((e) => {
      console.log('Error clearing job: ', e);
    });
  // Remove temp files
  del([dir + '/**', __dirname + '/../uploads/audio' + name + '.mp3'], { force: true })
    .then((paths) => {
      console.log('Deleted files and folders:\n', paths.join('\n'));
    });
}
