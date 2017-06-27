const { spawn } = require('child_process');
const path = require('path');
const request = require('request');
const fs = require('fs');
const del = require('del');
const slash = require('slash');
const async = require('async');
const appRoot = path.resolve(__dirname, '../');
const platform = process.platform;


module.exports.download = (uri, path, callback) => {
    request.head(uri, (err, res, body) => {
        request(uri).pipe(fs.createWriteStream(path)).on('close', callback);
    });
}

module.exports.downloadSlides = (socket, dirs, slides, callback) => {
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

module.exports.createTempDirs = root => {
    const dirs = {};
    return new Promise((resolve, reject) => {
        try {
            fs.mkdir(root, e => {
                async.each(['images', 'aep', 'videos', 'json', 'audio'], (name, callback) => {
                    let dir = `${root}/${name}`;
                    fs.mkdir(dir, e => {
                        dirs[name] = `${dir}/`;
                        callback(null);
                    });
                }, e => {
                    if (e) {
                        reject(e);
                        return;
                    }
                    resolve(dirs);
                });
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports.cleanFileName = name => {
    try {
        return decodeURIComponent(name).split('/').pop().toLowerCase().match(/.*\.(?:gif|jpg|jpeg|png|mp4|mov|m4v)/)[0];
    } catch(e) {
        return '';
    }
}

module.exports.writeFile = (name, data, callback) => {
    fs.writeFile(name, JSON.stringify(data), 'utf8', (err) => {
        callback(null);
    });
}

module.exports.clearFiles = fileArr => {
    del(fileArr, { force: true })
        .then((paths) => {
            console.log('Deleted files and folders:\n', paths.join('\n'));
        });
}

module.exports.runAeScriptFile = (file, id) => {
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

module.exports.runAeRender = options => {
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

module.exports.emit = (socket, data) => {
    if (socket) {
        socket.emit(...data);
    }
}
