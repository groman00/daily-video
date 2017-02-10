var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var dir = {
  images: __dirname + '/../temp/images/',
  json: __dirname + '/../temp/json/',
  resources: __dirname + '/../resources/'
};
var jobsFile = dir.resources + 'json/jobs.json';

function download(uri, path, callback){
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

function clearJob(name) {
  var jobs = getJobs();
  jobs.activeJobs = jobs.activeJobs.filter(function (job) {
    return job !== name;
  });
  writeJobs(jobs);
}

function cleanFiles(files) {
  files.forEach(function (file) {
    if (typeof file === 'object') {
      file = file.path;
    }
    fs.unlink(file, function (err) {
        if (err) {
          console.log('error deleting: ' + file);
        }
        console.log('successfully deleted: ' + file);
    });
  });
};

module.exports = function (socket, config) {
  var ae;
  var promise;
  var configFile = dir.json + 'config' + config.timestamp + '.json';

  // Download images locally
  promise = new Promise(function(resolve, reject) {
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

  promise.then(function () {

    socket.emit('progress', {
      message: 'Preparing Video Data'
    });

    // Write config file for this job
    fs.writeFileSync(configFile, JSON.stringify(config), 'utf8');

    // Add job to jobs config file
    queueCurrentJob(config.timestamp);

    // Run AE script
    ae = spawn('osascript', [
        '-e', 'tell application "Adobe After Effects CC 2017" to activate',
        '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "/Library/WebServer/Documents/alpha/daily-video/resources/jsx/DailyVideo.jsx"'
    ]);

    // ae.stderr.on('data', function (data) {
        // Error occured
        // console.log('stderr: ' + data);
    // });

    ae.on('close', function (code) {
        console.log('Video has rendered');
        socket.emit('progress', {
          message: 'Rendering Video'
        });
        clearJob(config.timestamp);
        cleanFiles([configFile]);
    });

  });

}