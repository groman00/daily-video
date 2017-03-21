const path = require('path');
const async = require('async');
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
            // console.log("running ae ccript for preview");
            ae = helpers.runAeScriptFile('SlidePreview_Test', id);
            ae.on('close', (code) => {
              this.jobQueue.jobComplete(job);
              callback(null);
            });
        },

      ], (err, result) => {
        // helpers.clearFiles([dir + '/**']);
        // Remove preview from db...
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
