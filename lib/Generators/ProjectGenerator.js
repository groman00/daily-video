const path = require('path');
const async = require('async');
const helpers = require('../helpers');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');

class ProjectGenerator {

  constructor(jobQueue) {
      this.jobQueue = jobQueue;
  }

  /**
   * Generate AEP file from project data
   */
  generate(job) {
    const id = job._id;
    const dir = appRoot + '/temp/' + id;
    let tempDirs;
    let ae;

    Project.findById(job.projectId, (err, project) => {

      async.waterfall([

        (callback) => {
          console.log('creating temp dirs');
          helpers.createTempDirs(dir, callback);
        },

        (dirs, callback) => {
          console.log('Downloading Images');
          tempDirs = dirs;
          helpers.downloadSlides(tempDirs.images, project.slides, callback);
        },

        (callback) => {
          console.log('Writing Project Config');
          helpers.writeFile(tempDirs.json + 'config.json', project, callback);
        },

        (callback) => {
          console.log('Running AE Script');
          // ae = helpers.runAeScriptFile('DailyVideo_Test');
          ae = helpers.runAeScriptFile('DailyVideo_Test', id);
          ae.on('close', (code) => {
            callback(null);
          });
        }

      ], (err, result) => {

        // fire complete event regardless of error.  maybe pass the error event to prevent render job
        this.jobQueue.projectJobComplete(job);

        if (err) {
          console.log('Error running job', err);
          return false;
        }
        console.log('job complete')
      });

    });

  }
}

module.exports = ProjectGenerator;
