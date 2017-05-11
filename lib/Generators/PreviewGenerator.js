const fs = require('fs');
const path = require('path');
const async = require('async');
const chokidar = require('chokidar');
const helpers = require('../helpers');
const Preview = require('../Models/Preview');
const appRoot = path.resolve(__dirname, '../../');
const io = require('../../io');

class PreviewGenerator {

  constructor(jobQueue) {
      this.jobQueue = jobQueue;
  }

  /**
   * Generate AEP file from project data
   */
  generate(job) {
    const id = job.previewId;
    const dir = `${appRoot}/temp/${id}`;
    const socket = io().sockets.connected[job.socketId];
    let ae;

    Preview.findById(id, (err, preview) => {
      async.waterfall([
        (callback) => {
            console.log("running ae script for preview");
            helpers.emit(socket, ['progress', { message: 'Generating Preview' }]);
            ae = helpers.runAeScriptFile('SlidePreview', id);
            ae.on('close', (code) => {
              this.jobQueue.jobComplete(job);
              callback(null);
            });
        },
        (callback) => {
          fs.readdir(`${appRoot}/public/exports/preview_${id}/`, (e, files) => {
            callback(null, files);
          });
        }
      ], (e, files) => {
        helpers.clearFiles([dir + '/**']);
        Preview.findByIdAndRemove(id, () => {});
        if (e) {
          console.log('Error running job', e);
          helpers.emit(socket, ['preview-error']);
          this.jobQueue.jobComplete(job);
          return false;
        }
        console.log('job complete')
        helpers.emit(socket, ['progress', { progress: 0, message: '' }]);
        helpers.emit(socket, ['preview-ready', {
          'files': files,
          'previewId': preview._id
        }]);
      });

    });

  }

}

module.exports = PreviewGenerator;
