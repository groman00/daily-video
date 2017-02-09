var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var dir = {
  images: __dirname + '/../temp/images/',
  json: __dirname + '/../temp/json/',
  resources: __dirname + '/../resources/'
};
var jobsFile = dir.resources + 'json/jobs.json';

function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
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

module.exports = function (config) {
  var ae;
  var configFile = dir.json + 'config' + config.timestamp + '.json';
  // Write config file for this job
  fs.writeFileSync(configFile, JSON.stringify(config), 'utf8');

  // Add job to jobs config file
  queueCurrentJob(config.timestamp);

  // Run AE script
  ae = spawn('osascript', [
      '-e', 'tell application "Adobe After Effects CC 2017" to activate',
      '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "/Library/WebServer/Documents/alpha/daily-video/resources/jsx/DailyVideo.jsx"'
  ]);

  ae.stderr.on('data', function (data) {
      // Error occured
      // console.log('stderr: ' + data);
  });

  ae.on('close', function (code) {
      console.log('Video has rendered');
      clearJob(config.timestamp);
      cleanFiles([configFile]);
  });

}