const { spawn } = require('child_process');
const path = require('path');
const request = require('request');
const fs = require('fs');
const appRoot = path.resolve(__dirname, '../');

module.exports.download = function(uri, path, callback) {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}

module.exports.downloadSlides = function(dir, slides, callback) {
  let imageCount;
  let count = 0;
  let localPath;
  try {
    imageCount = slides.length;
    // socket.emit('progress', {
    //   progress: 0,
    //   message: 'Downloading Images'
    // });
    slides.forEach((slide, i) => {
      if (!slide.image) {
        count = count + 1;
        if (count === imageCount) {
          callback(null);
        }
        return false;
      }
      localPath = dir + decodeURIComponent(slide.image).split('/').pop().split('&').shift();
      ((s, path) => {
        this.download(s.image, path, () => {
          s.image = path; // set image using local path
          count = count + 1;
          console.log('image ' + count + ' downloaded');
          // socket.emit('progress', {
          //   progress: count / imageCount,
          //   message: 'Downloading Image: ' + count + ' of ' + imageCount
          // });
          if (count === imageCount) {
            callback(null);
          }
        });
      })(slide, localPath);
    });
  } catch (e) {
    callback(e);
  }
};

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

module.exports.runAeScriptFile = function(file, jobId) {
    // return spawn('osascript', [
    //     '-e', 'tell application "Adobe After Effects CC 2017" to activate',
    //     '-e', 'tell application "Adobe After Effects CC 2017" to DoScriptFile "' + path.normalize(__dirname + '/../resources/jsx/' + file + '.jsx') + '"'
    // ]);
    let script = "#include '" + (appRoot + '/resources/jsx/' + file + '.jsx') + "';main('" + jobId + "', '" + appRoot + "');";
    return spawn('osascript', [
        '-e', 'tell application "Adobe After Effects CC 2017" to activate',
        '-e', 'tell application "Adobe After Effects CC 2017" to DoScript "' + script + '"'
    ]);
}
