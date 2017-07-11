const fs = require('fs');
const path = require('path');
const async = require('async');
const chokidar = require('chokidar');
const ffmpeg = require('fluent-ffmpeg');
const helpers = require('../helpers');
const Preview = require('../Models/Preview');
const io = require('../../io');
const aws = require('../Services/aws');
const PreviewGeneratorError = require('../Error/PreviewGenerator');
const progressResponse = require('../Responses/progress');
const previewResponse = require('../Responses/preview');
const errorHandler = require('../Error/handler');
const appRoot = path.resolve(__dirname, '../../');

class PreviewGenerator {

    constructor(jobQueue) {
        this.jobQueue = jobQueue;
    }

    /**
     * Generate AEP file from project data
     */
    generate(job) {
        const id = job.previewId;
        const dir = `${appRoot}/temp/${id}`;
        const socket = io().sockets.connected[job.socketId];
        const exportedFile = `${appRoot}/public/exports/Preview_${id}`;
        let ae;
        let ffCommand;

        Preview.findById(id, (err, preview) => {
            async.waterfall([
                (callback) => {
                    console.log("running ae script for preview");
                    progressResponse(socket, { message: 'Generating Preview' });
                    ae = helpers.runAeScriptFile('SlidePreview', id);
                    ae.on('close', code => {
                        this.jobQueue.jobComplete(job);
                        // Check for ae script error
                        fs.readFile(`${dir}/error.txt`, 'utf8', (e, errorMessage) => {
                            if (e) {
                                callback(null);
                                return;
                            }
                            callback(new Error(errorMessage));
                        });
                    });
                },
                (callback) => {
                    ffCommand = ffmpeg(`${exportedFile}.mov`)
                        .audioCodec('aac')
                        .videoCodec('libx264')
                        .format('mp4')
                        .on('progress', progress => {
                            progressResponse(socket, { progress: progress.percent / 100, message: 'Converting' });
                        })
                        .on('end', (stdout, stderr) => {
                            callback(null);
                        })
                        .on('error', (e, stdout, stderr) => {
                            callback(e);
                        })
                        .save(`${exportedFile}.mp4`);
                },
                (callback) => {
                    // Upload to s3
                    progressResponse(socket, { message: 'Preparing File' });
                    aws.upload(`${exportedFile}.mp4`, 'exports')
                        .then(s3Data => {
                            callback(null, s3Data.Location);
                        })
                        .catch(e => {
                            callback(e);
                        });
                }
            ], (e, file) => {
                Preview.findByIdAndRemove(id, () => {});
                if (e) {
                    console.log('Error running job', e);
                    errorHandler(new PreviewGeneratorError(e.message), socket, { 'previewId': preview._id });
                    this.jobQueue.jobComplete(job);
                    return false;
                }
                progressResponse(socket, { progress: 0, message: '' });
                previewResponse(socket, { 'file': file, 'previewId': preview._id });
            });

        });

    }

}

module.exports = PreviewGenerator;
