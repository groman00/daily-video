const { spawn } = require('child_process');
const path = require('path');
const request = require('request');
const fs = require('fs');

module.exports.download = function(uri, path, callback) {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}

module.exports.createTempDirs = function(root, callback) {
  const dirs = {};
  const dirNames = ['images', 'aep', 'json'];
  let count = 0;
  try {
    fs.mkdir(root, (e) => {
      dirNames.forEach((name, i) => {
        (path => {
          fs.mkdir(path, (e) => {
            count = count + 1;
            dirs[name] = path + '/';
            if (count === dirNames.length) {
              // tempDirs = dirs;
              callback(null, dirs);
            }
          });
        })(root + '/' + name);
      });
    });
  } catch (e) {
    callback(e);
  }
}

module.exports.cleanImageFileName = function (name) {
  return decodeURIComponent(name).split('/').pop().split('&').shift();
}

module.exports.writeFile = function(name, data, callback) {
  fs.writeFile(name, JSON.stringify(data), 'utf8', (err) => {
    callback(null);
  });
}

module.exports.runAeScriptFile = function(file) {
    return spawn('osascript', [
        '-e', 'tell application "Adobe After Effects CC 2017" to activate',
        '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "' + path.normalize(__dirname + '/../resources/jsx/' + file + '.jsx') + '"'
    ]);
}
