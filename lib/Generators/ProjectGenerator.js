const path = require('path');
const async = require('async');
const ffmpeg = require('fluent-ffmpeg');
const helpers = require('../helpers');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');
const io = require('../../io');
const aws = require('../Services/aws');

class ProjectGenerator {

    constructor(jobQueue) {
        this.jobQueue = jobQueue;
    }

    /**
     * Generate AEP file from project data
     */
    generate(job) {
        const id = job.projectId;
        const dir = `${appRoot}/temp/${id}`;
        const socket = io().sockets.connected[job.socketId];
        const exportedFile = `${appRoot}/public/exports/DailyVideo_${id}`;
        let ae;
        let ffCommand;

        Project.findById(id, (err, project) => {
            async.waterfall([
                (callback) => {
                    console.log('Running AE Script');
                    helpers.emit(socket, ['progress', { message: 'Generating Project' }]);
                    // callback('Error');
                    // return false
                    ae = helpers.runAeScriptFile('DailyVideo', id);
                    ae.on('close', (code) => {
                        this.jobQueue.jobComplete(job);
                        callback(null);
                        });
                },
                (callback) => {
                    // callback(null);
                    // return false;
                    ae = helpers.runAeRender({
                        project: `${dir}/aep/DailyVideo.aep`,
                        comp: `Master_${id}`,
                        rsTemplate: (project.preview ? 'Low_Res' : 'Best Settings'),
                        output: `${exportedFile}.mov`
                    });
                    ae.stdout.on('data', (data) => {
                        // [ 'PROGRESS:', '', '0:00:05:18', '(169):', '0', 'Seconds\n' ]
                        // console.log(data);
                        let progress = (parseInt(data.toString().split(' (')[1]) / 30) / project.videoDuration;
                        if (!isNaN(progress)) {
                            // console.log(progress);
                            helpers.emit(socket, ['progress', {
                                progress: progress,
                                message: 'Rendering'
                            }]);
                        }
                    });
                    ae.on('close', (code) => {
                            callback(null);
                    });
                },
                (callback) => {

                    // if mp4 not desired...
                    // callback(null, 'mov');

                    // convert file to mp4
                    // ffmpeg -i .mov -vcodec h264 -acodec aac -strict -2 {out-video}.mp4
                    ffCommand = ffmpeg(`${exportedFile}.mov`)
                        .audioCodec('aac')
                        .videoCodec('libx264')
                        .format('mp4')
                        .on('progress', (progress) => {
                            // console.log('Processing: ' + progress.percent + '% done');
                            helpers.emit(socket, ['progress', {
                                progress: progress.percent / 100,
                                message: 'Converting'
                            }]);
                        })
                        .on('end', function(stdout, stderr) {
                            // console.log('Transcoding succeeded !');
                            callback(null, 'mp4');
                        })
                        .on('error', function(e, stdout, stderr) {
                            callback(e);
                        })
                        .save(`${exportedFile}.mp4`);

                },
                (fileType, callback) => {
                    // upload to s3
                    // callback(null, '/exports/' + exportedFile.split('/').pop());
                    callback(null, `/exports/${exportedFile.split('/').pop()}.${fileType}`);
                    return false;

                    helpers.emit(socket, ['progress', {
                        message: 'Preparing File'
                    }]);
                    aws.upload(`${exportedFile}.${fileType}`, 'exports')
                        .then((s3Data) => {
                            callback(null, s3Data.Location);
                        })
                        .catch((e) => {
                            helpers.emit(socket, ['jobError', err.toString()]);
                            callback(e);
                        });
                }
            ], (e, result) => {
                // helpers.clearFiles([
                //     dir + '/**',
                //     exportedFile + '.*'
                // ]);
                Project.findByIdAndRemove(id, () => {});
                // [dir + '/**', __dirname + '/../uploads/audio' + name + '.mp3']
                if (e) {
                    console.log('Error running job', e);
                    helpers.emit(socket, ['jobError', e.toString()]);
                    this.jobQueue.jobComplete(job);
                    return false;
                }
                helpers.emit(socket, ['complete', {
                    file: result
                }]);
            });
        });
    }
}

module.exports = ProjectGenerator;
