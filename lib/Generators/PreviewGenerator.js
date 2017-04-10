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
    const id = job._id;
    const socket = io().sockets.connected[job.socketId];
    const dir = appRoot + '/temp/' + id;
    // let exportedFile;
    let tempDirs;
    let ae;
    let slide;

    Preview.findById(job.previewId, (err, preview) => {
      slide = preview.slide;
      // exportedFile = appRoot + '/public/exports/preview_' + preview._id + '.mp4';

      async.waterfall([

        (callback) => {
          console.log('creating temp dirs');
          helpers.createTempDirs(dir, callback);
        },

        (dirs, callback) => {
          // console.log('Temp Directories Created');
          const localFile = [dirs.images, helpers.cleanImageFileName(slide.image)].join('');
          tempDirs = dirs;
          helpers.download(slide.image_url_large, localFile, () => {
            slide.image = localFile;
            callback(null);
          });
        },

        (callback) => {
          console.log('writing preview config');
          helpers.writeFile(tempDirs.json + 'config.json', preview, callback);
        },

        (callback) => {
            console.log("running ae script for preview");
            ae = helpers.runAeScriptFile('SlidePreview', id);
            ae.on('close', (code) => {
              this.jobQueue.jobComplete(job);
              callback(null);
            });
        },

        (callback) => {
          fs.readdir(appRoot + '/public/exports/preview_' + preview._id + '/', (err, files) => {
            callback(null, files);
          });
        }

      ], (err, files) => {
        helpers.clearFiles([dir + '/**']);
        Preview.findByIdAndRemove(preview._id, () => {});
        if (err) {
          console.log('Error running job', err);
          helpers.emit(socket, ['preview-error']);
          return false;
        }
        console.log('job complete')
        helpers.emit(socket, ['preview-ready', {
          'files': files,
          'previewId': preview._id
        }]);
      });

    });

  }
}

module.exports = PreviewGenerator;
