const { spawn } = require('child_process');
const path = require('path');
const request = require('request');
const fs = require('fs');
const del = require('del');
const appRoot = path.resolve(__dirname, '../');

module.exports.download = function(uri, path, callback) {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}

module.exports.downloadSlides = function(socket, dir, slides, callback) {
  let imageCount;
  let count = 0;
  let localPath;
  try {
    imageCount = slides.length;
    slides.forEach((slide, i) => {
      if (!slide.image) {
        count = count + 1;
        if (count === imageCount) {
          callback(null);
        }
        return false;
      }
      localPath = dir + this.cleanImageFileName(slide.image);
      ((s, path) => {
        this.download(s.image, path, () => {
          s.image = path; // set image using local path
          count = count + 1;
          console.log('image ' + count + ' downloaded');
          this.emit(socket, ['progress', {
            progress: count / imageCount,
            message: 'Downloading Image: ' + count + ' of ' + imageCount
          }]);
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
  return decodeURIComponent(name).split('/').pop().match(/.*\.(?:gif|jpg|jpeg|png)/)[0];
}

module.exports.writeFile = function(name, data, callback) {
  fs.writeFile(name, JSON.stringify(data), 'utf8', (err) => {
    callback(null);
  });
}

module.exports.clearFiles = function (fileArr) {
  del(fileArr, { force: true })
    .then((paths) => {
      console.log('Deleted files and folders:\n', paths.join('\n'));
    });
}

module.exports.runAeScriptFile = function(file, jobId) {
  let script = "#include '" + (appRoot + '/resources/jsx/' + file + '.jsx') + "';main('" + jobId + "', '" + appRoot + "');";
  return spawn('osascript', [
    '-e', 'tell application "Adobe After Effects CC 2017" to activate',
    '-e', 'tell application "Adobe After Effects CC 2017" to DoScript "' + script + '"'
  ]);
}

module.exports.runAeRender = function (options) {
  return spawn('/Applications/Adobe\ After\ Effects\ CC\ 2017/aerender', [
    // '-reuse', // WHY IS THIS BREAKING (SOMETIMES)???!!!
    '-project', options.project,
    '-comp', options.comp,
    '-RStemplate', options.rsTemplate,
    '-OMtemplate', 'Quicktime_H264',
    '-output', options.output
  ]);
}

module.exports.emit = function (socket, data) {
  if (socket) {
    socket.emit(...data);
  }
}
