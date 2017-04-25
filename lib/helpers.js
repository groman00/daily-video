const { spawn } = require('child_process');
const path = require('path');
const request = require('request');
const fs = require('fs');
const del = require('del');
const slash = require('slash');
const appRoot = path.resolve(__dirname, '../');
const platform = process.platform;


module.exports.download = function(uri, path, callback) {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}

module.exports.downloadSlides = function(socket, dirs, slides, callback) {
  let imageCount;
  let count = 0;
  let localPath;
  let dirtyFileName;
  let dir;

  try {
    slides
      .filter((slide) => {
        return slide.data.slideType === 'image' || slide.data.slideType === 'video';
      })
      .forEach((slide, i, iterable) => {
        if (slide.data.slideType === 'image') {
          dirtyFileName = slide.image;
          dir = dirs.images;
        } else {
          dirtyFileName = slide.data.video.source;
          dir = dirs.videos;
        }
        localPath = [dir, slide.id, '_', this.cleanFileName(dirtyFileName)].join('');
        ((s, path) => {
          const type = s.data.slideType;
          this.download((type === 'image' ? s.image_url_large : slide.data.video.source), path, () => {
            if (type === 'image') {
              s.image = path; // set image using local path
            } else {
              s.video = path; // set video using local path
            }
            count = count + 1;
            console.log('slide ' + count + ' downloaded');
            this.emit(socket, ['progress', {
              progress: count / iterable.length,
              message: 'Downloading Slide: ' + count + ' of ' + iterable.length
            }]);
            if (count === iterable.length) {
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
  const dirNames = ['images', 'aep', 'json', 'videos'];
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

//module.exports.cleanImageFileName = function (name) {
module.exports.cleanFileName = function (name) {
  return decodeURIComponent(name).split('/').pop().toLowerCase().match(/.*\.(?:gif|jpg|jpeg|png|mp4|mov)/)[0];
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

  if (platform === 'darwin') {
    return spawn('osascript', [
      '-e', 'tell application "Adobe After Effects CC 2017" to activate',
      '-e', 'tell application "Adobe After Effects CC 2017" to DoScript "' + script + '"'
    ]);
  }

  return spawn('afterfx', [
    '-noui',
    '-s', slash(script)
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
