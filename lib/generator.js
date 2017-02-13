var fs = require('fs');
var request = require('request');
var del = require('del');
var spawn = require('child_process').spawn;
var jobsFile = __dirname + '/../resources/json/jobs.json';

function download(uri, path, callback){
  console.log(path)
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}

function getJobs() {
  return JSON.parse(fs.readFileSync(jobsFile));
}

function writeJobs(jobs) {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs), 'utf8');
}

function queueCurrentJob(name) {
  var jobs = getJobs()
  jobs.activeJobs.push(name);
  writeJobs(jobs);
}

function clearJob(timestamp) {
  // remove job from jobs file
  var jobs = getJobs();
  jobs.activeJobs = jobs.activeJobs.filter(function (job) {
    return job !== timestamp;
  });
  writeJobs(jobs);

  // remove temp files
  del([
    __dirname + '/../temp/' + timestamp + '/**',
    __dirname + '/../uploads/audio' + timestamp + '.mp3'
  ])
  .then(function (paths) {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
}

function mkdir(path, callback) {
  fs.mkdir(path, callback);
}

function createTempDirs(names, ts) {
  var count = 0;
  var obj = {};
  var tempPath = __dirname + '/../temp/' + ts;
  return new Promise(function (resolve, reject) {
    mkdir(tempPath, function (e) {
      names.forEach(function (name, i) {
        var path = tempPath + '/' + name;
        (function (p) {
          mkdir(p, function (e) {
            count = count + 1;
            obj[name] = path + '/';
            if (count === names.length) {
              resolve(obj);
            }
          });
        }(path));
      });
    })
  });
}

module.exports = function (socket, config) {
  var timestamp = config.timestamp
  var exportedFile = __dirname + '/../public/exports/DailyVideo' + timestamp + '.mp4'
  var ae;
  var downloadPromise;
  var dir;
  var imageDownload;

  /**
   * Create directories for temporary files
   */
  createTempDirs(['images', 'aep', 'json'], timestamp)
    .then(function (tempDirs) {
      dir = tempDirs;

      /**
       * Download images locally
       */
      imageDownload = new Promise(function(resolve, reject) {
        var count = 0;
        var imageCount = config.slides.length;
        var localPath;
        socket.emit('progress', {
          progress: 0,
          message: 'Downloading Images'
        });
        config.slides.forEach(function (slide, i) {
          localPath = dir.images + decodeURIComponent(slide.image).split('/').pop();
          (function (slide, path) {
            download(slide.image, path, function () {
              slide.image = path; // set image using local path
              count = count + 1;
              if (count === imageCount) {
                resolve();
              }
              socket.emit('progress', {
                progress: count / imageCount,
                message: 'Downloading Image: ' + count + ' of ' + imageCount
              });
            });
          }(slide, localPath));
        });
      });

      /**
       * Directories and image are ready.  Fire off After Effects job.
       */
      imageDownload
        .then(function () {

          socket.emit('progress', {
            message: 'Preparing Video Data'
          });

          // Write config file for this job
          fs.writeFileSync(dir.json + 'config.json', JSON.stringify(config), 'utf8');

          // Add job to jobs config file
          queueCurrentJob(timestamp);

          // Run AE script
          ae = spawn('osascript', [
              '-e', 'tell application "Adobe After Effects CC 2017" to activate',
              '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "/Library/WebServer/Documents/alpha/daily-video/resources/jsx/DailyVideo.jsx"'
          ]);


          /*
            //https://www.themarketingtechnologist.co/creating-dynamic-videos-using-javascript-and-after-effects-the-basics/
            AE RENDER COMMAND
            still doesn't render with AME!
            /Applications/Adobe\ After\ Effects\ CC\ 2017/aerender -project /Library/WebServer/Documents/alpha/daily-video/temp/_1486765223715/aep/DailyVideo.aep -comp Master_1486765223715 -output /Library/WebServer/Documents/alpha/daily-video/public/exports/DailyVideo_1486765223715.mp4
          */


          // ae.stderr.on('data', function (data) {
              // Error occured
              // console.log('stderr: ' + data);
          // });

          ae.on('close', function (code) {
              console.log('Video rendering');
              socket.emit('progress', {
                message: 'Rendering Video'
              });

              // Since we can't track progress in AME, manually wait for file to exist.
              fs.watchFile(exportedFile, function(curr, prev) {
                console.log('the current mtime is' + curr.mtime);
                console.log('the previous mtime was' + prev.mtime);
                if ((new Date(curr.mtime)).getTime() > (new Date(prev.mtime)).getTime()) {
                  console.log('FILE DONE')
                  fs.unwatchFile(exportedFile);
                  socket.emit('complete', {
                    file: '/exports/' + exportedFile.split('/').pop()
                  });

                  // Clear job and remove temp files
                  clearJob(timestamp);
                }
              });
          });
        })
        .catch(function (e) {
          console.log('Error running job', e);
          socket.emit('jobError', e.toString());
          clearJob(timestamp);
        });
    })
    .catch(function (e) {
      console.log('Error creating directories', e);
      socket.emit('jobError', e.toString());
      clearJob(timestamp);
    });
}
