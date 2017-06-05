const { spawn } = require('child_process');
const path = require('path');
const request = require('request');
const fs = require('fs');
const del = require('del');
const slash = require('slash');
const appRoot = path.resolve(__dirname, '../');
const platform = process.platform;
let renderSocketId;

module.exports.download = function (uri, path, callback) {
    request.head(uri, (err, res, body) => {
        request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
    });
}

module.exports.downloadSlides = function (socket, dirs, slides, callback) {
    let imageCount;
    let count = 0;
    let localPath;
    let dirtyFileName;
    let dir;
    let filteredSlides;
    let slideData;

    try {
        filteredSlides = slides.filter((slide) => {
            slideData = slide.data;
            if (['image', 'title'].includes(slideData.slideType)) {
                // ignore image if it's set to the default pixel.
                if (slide.image === 'https://s3.amazonaws.com/alpha-global-origin/daily-video/pixel.jpg') {
                    slide.image = '';
                    return false;
                }
                return true;
            }
            if (['video'].includes(slideData.slideType)) {
                return !!slideData.video.source;
            }
            return false;
        });
        if (!filteredSlides.length) {
            callback(null, dirs)
            return;
        }
        filteredSlides.forEach((slide, i, iterable) => {
            if (slide.data.slideType === 'video') {
                dirtyFileName = slide.data.video.source;
                dir = dirs.videos;
            } else {
                dirtyFileName = slide.image;
                dir = dirs.images;
            }
            localPath = [dir, slide.id, '_', this.cleanFileName(dirtyFileName)].join('');
            ((s, path) => {
                const type = s.data.slideType;
                this.download((type === 'video' ? slide.data.video.source : s.image_url_large), path, () => {
                    if (type === 'video') {
                        s.video = path; // set video using local path
                    } else {
                        s.image = path; // set image using local path
                    }
                    count = count + 1;
                    // console.log('slide ' + count + ' downloaded');
                    this.emit(socket, ['progress', {
                        progress: count / iterable.length,
                        message: 'Downloading Asset: ' + count + ' of ' + iterable.length
                    }]);
                    if (count === iterable.length) {
                        callback(null, dirs);
                    }
                });
            })(slide, localPath);
        });

    } catch (e) {
        callback(e);
    }
};

module.exports.createTempDirs = function (root, callback) {
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

module.exports.cleanFileName = function (name) {
    try {
        return decodeURIComponent(name).split('/').pop().toLowerCase().match(/.*\.(?:gif|jpg|jpeg|png|mp4|mov|m4v)/)[0];
    } catch(e) {
        return '';
    }
}

module.exports.writeFile = function (name, data, callback) {
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

module.exports.runAeScriptFile = function (file, id) {
    let script = "#include '" + (appRoot + '/resources/jsx/' + file + '.jsx') + "';main('" + id + "', '" + appRoot + "');";
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
    let command = 'aerender';
    if (platform === 'darwin') {
        command = '/Applications/Adobe\ After\ Effects\ CC\ 2017/' + command;
    }

    /*
    console.log([
        // '-reuse',
        '-project', options.project,
        '-comp', options.comp,
        '-RStemplate', options.rsTemplate,
        '-OMtemplate', 'Quicktime_H264',
        '-output', options.output
    ].join(' '))
    */

    return spawn(command, [
        // '-reuse',
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

module.exports.setRenderSocketId = (socketId) => {
    console.log('Registered render server on: ' + socketId);
    renderSocketId = socketId;
}

module.exports.getRenderSocketId = () => {
    return renderSocketId;
}
