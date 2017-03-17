const { spawn } = require('child_process');
const del = require('del');
const chokidar = require('chokidar');
const async = require('async');
const helpers = require('./helpers');
const jobs = require('./jobs');

let jobDir;
let tempDirs;

/**
 *
 * Todo, need helper for socket, so that the server doesn't crash on socket failure...
 *
 */

module.exports = function (socket, slide, timestamp) {
  let exportedFile;
  let ae;

  slide.timestamp = timestamp;
  jobDir = __dirname + '/../temp/' + timestamp;
  exportedFile = __dirname + '/../public/exports/preview_' + slide.id + timestamp + '.mp4';
  // exportedFile = __dirname + '/../public/exports/preview_' + slide.id + '.mp4';

  async.waterfall([
    (callback) => {
      helpers.createTempDirs(jobDir, callback);
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
      // console.log('Images Downloaded');
      helpers.writeFile(tempDirs.json + 'config.json', slide, callback);
    },
    (callback) => {
      // console.log('config.json added to temp folder.  Added job to queue');
      jobs.queue(timestamp, callback);
    },
    // (callback) => {
    //   // Delete current preview, if it exists
    //   del([exportedFile], { force: true })
    //     .then((paths) => {
    //       console.log('Deleted files and folders:\n', paths.join('\n'));
    //       callback();
    //     });
    // },
    (callback) => {
        console.log("Running AE Script for Preview");
        ae = helpers.runAeScriptFile('SlidePreview');
        ae.on('close', (code) => {
          callback(null);
        });
    },
    (callback) => {
      var watcher = chokidar.watch(exportedFile, {
          persistent: true
      });
      watcher
        .on('add', path => {
          console.log('file added', path);
          watcher.close();
          ae = helpers.runAeScriptFile('CloseProject');
          ae.on('close', (code) => {
            callback(null);
          });
        });
    }
  ], (err, result) => {
    if (err) {
      console.log('Error running job', err);
      jobs.clearJob(jobDir, timestamp);
      return false;
    }
    socket.emit('preview-ready', exportedFile.split('/').pop());
    jobs.clearJob(jobDir, timestamp);

  });
}