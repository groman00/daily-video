// const { spawn } = require('child_process');
// const fs = require('fs');
const path = require('path');
// const del = require('del');
// const chokidar = require('chokidar');
// const request = require('request');
const async = require('async');
// const aeScriptFile = path.normalize(__dirname + '/../resources/jsx/DailyVideo.jsx');
// const jobsFile = __dirname + '/../resources/json/jobs.json';
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
          ae = helpers.runAeScriptFile('DailyVideo_Test');
          ae.on('close', (code) => {
            callback(null);
          });
        }

      ], (err, result) => {
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