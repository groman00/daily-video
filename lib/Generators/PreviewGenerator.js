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
    let tempDirs;
    let ae;
    let slide;
    let type;

    Preview.findById(job.previewId, (err, preview) => {
      slide = preview.slide;
      type = slide.data.slideType;

      async.waterfall([

        (callback) => {
          console.log('creating temp dirs');
          helpers.createTempDirs(dir, callback);
        },

        (dirs, callback) => {
          let downloadUrl;
          let localFile;

          tempDirs = dirs;

          // todo: clean this up
          if (type === 'image') {
            downloadUrl = slide.image_url_large;
            localFile = [dirs.images, helpers.cleanFileName(slide.image)].join('');
            helpers.download(downloadUrl, localFile, () => {
              slide.image = localFile;
              callback(null);
            });
          } else if (type === 'video') {
            downloadUrl = slide.data.video.source;
            localFile = [dirs.videos, helpers.cleanFileName(downloadUrl)].join('');
            helpers.download(downloadUrl, localFile, () => {
              slide.video = localFile;
              callback(null);
            });
          } else {
            callback(null);
          }
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
        //helpers.clearFiles([dir + '/**']);
        Preview.findByIdAndRemove(preview._id, () => {});
        if (err) {
          console.log('Error running job', err);
          helpers.emit(socket, ['preview-error']);
          this.jobQueue.jobComplete(job);
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
