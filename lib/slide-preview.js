const { spawn } = require('child_process');
// const fs = require('fs');
// const path = require('path');
// const del = require('del');
const chokidar = require('chokidar');
const async = require('async');
// const aeScriptFile = path.normalize(__dirname + '/../resources/jsx/SlidePreview.jsx');
// const jobsFile = __dirname + '/../resources/json/jobs.json';
const helpers = require('./helpers');
const jobs = require('./jobs');


let jobDir;
let tempDirs;


module.exports = function (socket, slide, timestamp) {
  let exportedFile;
  let ae;

  slide.timestamp = timestamp;
  jobDir = __dirname + '/../temp/' + timestamp;
  exportedFile = __dirname + '/../public/exports/preview_' + slide.id + timestamp + '.mp4';

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
      // socket.emit('jobError', err.toString());
      // clearJob();
      return false;
    }
    socket.emit('preview-ready', exportedFile.split('/').pop());

  });
}