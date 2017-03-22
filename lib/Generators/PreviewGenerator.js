const path = require('path');
const async = require('async');
const chokidar = require('chokidar');
const helpers = require('../helpers');
const Preview = require('../Models/Preview');
const appRoot = path.resolve(__dirname, '../../');

class PreviewGenerator {

  constructor(jobQueue) {
      this.jobQueue = jobQueue;
  }

  /**
   * Generate AEP file from project data
   */
  generate(job) {
    const id = job._id;
    const dir = appRoot + '/temp/' + id;
    const exportedFile = appRoot + '/public/exports/preview_' + id + '.mp4';
    let tempDirs;
    let ae;
    let slide;

    Preview.findById(job.previewId, (err, preview) => {
      slide = preview.slide;

      async.waterfall([

        (callback) => {
          console.log('creating temp dirs');
          helpers.createTempDirs(dir, callback);
        },

        (dirs, callback) => {
          // console.log('Temp Directories Created');
          const localFile = [dirs.images, helpers.cleanImageFileName(slide.image)].join('');
          tempDirs = dirs;
          helpers.download(slide.image, localFile, () => {
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
          console.log("waiting for preview to render");
          var watcher = chokidar.watch(exportedFile, {
              persistent: true
          });
          watcher
            .on('add', path => {
              console.log('file added', path);
              watcher.close();
              callback(null);
            });
          }

      ], (err, result) => {
        helpers.clearFiles([dir + '/**']);
        Preview.findByIdAndRemove(preview._id, () => {});
        if (err) {
          console.log('Error running job', err);
          return false;
        }
        console.log('job complete')
      });

    });

  }
}

module.exports = PreviewGenerator;
