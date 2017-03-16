const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const del = require('del');
const chokidar = require('chokidar');
const request = require('request');
const async = require('async');
const aeScriptFile = path.normalize(__dirname + '/../resources/jsx/DailyVideo.jsx');
const jobsFile = __dirname + '/../resources/json/jobs.json';

let timestamp;
let jobDir;
let tempDirs;
let socket;

function download(uri, path, callback) {
  request.head(uri, (err, res, body) => {
      request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}

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

function writeFile(name, data, callback) {
  fs.writeFile(name, JSON.stringify(data), 'utf8', (err) => {
    callback(null);
  });
}

function writeJobs(jobs, callback) {
  writeFile(jobsFile, jobs, callback);
}

function queueCurrentJob(callback) {
  getJobs()
    .then((jobs) => {
      jobs.activeJobs.push(timestamp);
      writeJobs(jobs, callback);
    })
    .catch((e) => {
      callback(e);
    });
}

function clearJob() {
  // Remove job from jobs file
  getJobs()
    .then((jobs) => {
      jobs.activeJobs = jobs.activeJobs.filter((job) => {
        return job !== timestamp;
      });
      writeJobs(jobs, Function.prototype);
    })
    .catch((e) => {
      console.log('Error clearing job: ', e);
    });

  // Remove temp files
  del([jobDir + '/**', __dirname + '/../uploads/audio' + timestamp + '.mp3'], { force: true })
    .then((paths) => {
      console.log('Deleted files and folders:\n', paths.join('\n'));
    });
}

function mkdir(path, callback) {
  fs.mkdir(path, callback);
}

function createTempDirs(callback) {
  const dirs = {};
  const dirNames = ['images', 'aep', 'json'];
  let count = 0;
  try {
    fs.mkdir(jobDir, (e) => {
      dirNames.forEach((name, i) => {
        (path => {
          fs.mkdir(path, (e) => {
            count = count + 1;
            dirs[name] = path + '/';
            if (count === dirNames.length) {
              tempDirs = dirs;
              callback(null);
            }
          });
        })(jobDir + '/' + name);
      });
    });
  } catch (e) {
    callback(e);
  }
}

function downloadImages(slides, callback) {
  let imageCount;
  let count = 0;
  let localPath;
  try {
    imageCount = slides.length;
    socket.emit('progress', {
      progress: 0,
      message: 'Downloading Images'
    });
    slides.forEach((slide, i) => {
      if (!slide.image) {
        count = count + 1;
        if (count === imageCount) {
          callback(null);
        }
        return false;
      }
      localPath = tempDirs.images + decodeURIComponent(slide.image).split('/').pop().split('&').shift();
      ((s, path) => {
        download(s.image, path, () => {
          s.image = path; // set image using local path
          count = count + 1;
          console.log('image ' + count + ' downloaded');
          socket.emit('progress', {
            progress: count / imageCount,
            message: 'Downloading Image: ' + count + ' of ' + imageCount
          });
          if (count === imageCount) {
            callback(null);
          }
        });
      })(slide, localPath);
    });
  } catch (e) {
    callback(e);
  }
}


module.exports = function (currentSocket, config) {
  let exportedFile;
  let ae;

  socket = currentSocket;
  timestamp = config.timestamp
  jobDir = __dirname + '/../temp/' + timestamp;
  exportedFile = __dirname + '/../public/exports/DailyVideo' + timestamp + '.mp4';

  async.waterfall([
    (callback) => {
      createTempDirs(callback);
    },
    (callback) => {
      console.log('Temp Directories Created');
      downloadImages(config.slides, callback)
    },
    (callback) => {
      console.log('Images Downloaded');
      socket.emit('progress', {
        message: 'Writing Config'
      });
      writeFile(tempDirs.json + 'config.json', config, callback);
    },
    (callback) => {
      console.log('config.json added to temp folder.  Added job to queue');
      socket.emit('progress', {
        message: 'Queuing Job'
      });
      queueCurrentJob(callback);
    },
    (callback) => {
        console.log("Running AE Script");
        socket.emit('progress', {
          message: 'Running Job'
        });

        ae = spawn('osascript', [
            '-e', 'tell application "Adobe After Effects CC 2017" to activate',
            '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "' + aeScriptFile + '"'
        ]);
        ae.on('close', (code) => {
          callback(null);
        });

        // callback(null)
    },
    (callback) => {

      // https://www.themarketingtechnologist.co/creating-dynamic-videos-using-javascript-and-after-effects-the-basics/
      // AE RENDER COMMAND
      // /Applications/Adobe\ After\ Effects\ CC\ 2017/aerender -project /Library/WebServer/Documents/alpha/daily-video/temp/_1489096578448/aep/DailyVideo.aep -comp Master_1489096578448 -output /Library/WebServer/Documents/alpha/daily-video/public/exports/DailyVideo_1489096578448.mov
      // console.log('Rendering Video', [
      //   '-project', tempDirs.aep + 'DailyVideo.aep',
      //   '-comp', 'Master' + timestamp,
      //   '-RStemplate', (config.preview ? 'Low_Res' : 'Best Settings'),
      //   '-OMtemplate', 'Quicktime_H264',
      //   '-output', __dirname + '/../public/exports/DailyVideo' + timestamp + '.mov'
      // ].join(' '));
      console.log('Rendering Video');
      socket.emit('progress', {
        message: 'Preparing Video for Render'
      });

      // callback(null);

      ae = spawn('/Applications/Adobe\ After\ Effects\ CC\ 2017/aerender', [
        '-reuse',
        '-project', tempDirs.aep + 'DailyVideo.aep',
        '-comp', 'Master' + timestamp,
        '-RStemplate', (config.preview ? 'Low_Res' : 'Best Settings'),
        '-OMtemplate', 'Quicktime_H264',
        '-output', __dirname + '/../public/exports/DailyVideo' + timestamp + '.mov'
      ]);

      ae.stdout.on('data', (data) => {
          // Terrible progress indication...
          // [ 'PROGRESS:', '', '0:00:05:18', '(169):', '0', 'Seconds\n' ]
          // console.log(data);
          var progress = (parseInt(data.toString().split(' (')[1]) / 30) / config.videoDuration;

          if (!isNaN(progress)) {
            socket.emit('progress', {
              progress: progress,
              message: 'Rendering'
            });
          }
      });
      ae.on('close', (code) => {
          callback(null);
      });

    }
  ], (err, result) => {
    if (err) {
      console.log('Error running job', err);
      socket.emit('jobError', err.toString());
      clearJob();
      return false;
    }
    socket.emit('complete', {
      file: '/exports/' + exportedFile.split('/').pop().replace('.mp4', '.mov')
    });
    clearJob();

    // Since we can't track progress in AME, manually wait for file to exist.
    /*
    watcher = chokidar.watch(exportedFile, {
        persistent: true
    });
    watcher
      //.on('ready', () => {})
      .on('add', path => {
          console.log('file added', path);
          watcher.close();
          socket.emit('complete', {
            file: '/exports/' + path.split('/').pop()
          });
          clearJob();
      });
      */
  });
}
