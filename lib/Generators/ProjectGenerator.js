const fs = require('fs');
const path = require('path');
const async = require('async');
const ffmpeg = require('fluent-ffmpeg');
const helpers = require('../helpers');
const Project = require('../Models/Project');
const io = require('../../io');
const aws = require('../Services/aws');
const ProjectGeneratorError = require('../Error/ProjectGenerator');
const errorHandler = require('../Error/handler');
const progressResponse = require('../Responses/progress');
const projectResponse = require('../Responses/project');
const appRoot = path.resolve(__dirname, '../../');

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
                    progressResponse(socket, { message: 'Generating Project' });
                    ae = helpers.runAeScriptFile('DailyVideo', id);
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
                    ae = helpers.runAeRender({
                        project: `${dir}/aep/DailyVideo.aep`,
                        comp: `Master_${id}`,
                        rsTemplate: (project.preview ? 'Low_Res' : 'Best Settings'),
                        output: `${exportedFile}.mov`
                    });
                    ae.stdout.on('data', data => {
                        // [ 'PROGRESS:', '', '0:00:05:18', '(169):', '0', 'Seconds\n' ]
                        let progress = (parseInt(data.toString().split(' (')[1]) / 30) / project.videoDuration;
                        if (!isNaN(progress)) {
                            progressResponse(socket, { progress: progress, message: 'Rendering' });
                        }
                    });
                    ae.on('close', code => {
                        callback(null);
                    });
                },
                (callback) => {
                    /*
                    Convert file to mp4
                        ffmpeg -i .mov -vcodec h264 -acodec aac -strict -2 {out-video}.mp4
                    */
                    ffCommand = ffmpeg(`${exportedFile}.mov`)
                        .audioCodec('aac')
                        .videoCodec('libx264')
                        .format('mp4')
                        .on('progress', progress => {
                            progressResponse(socket, { progress: progress.percent / 100, message: 'Converting' });
                        })
                        .on('end', (stdout, stderr) => {
                            callback(null, 'mp4');
                        })
                        .on('error', (e, stdout, stderr) => {
                            callback(e);
                        })
                        .save(`${exportedFile}.mp4`);

                },
                (fileType, callback) => {
                    // Upload to S3
                    progressResponse(socket, { message: 'Preparing File' });
                    aws.upload(`${exportedFile}.${fileType}`, 'exports')
                        .then(s3Data => {
                            callback(null, s3Data.Location);
                        })
                        .catch((e) => {
                            callback(e);
                        });
                }
            ], (e, result) => {
                helpers.clearFiles([
                    dir + '/**',
                    exportedFile + '.*'
                ]);
                Project.findByIdAndRemove(id, () => {});
                if (e) {
                    console.log('Error running job', e);
                    errorHandler(new ProjectGeneratorError(e.message), socket);
                    this.jobQueue.jobComplete(job);
                    return false;
                }
                projectResponse(socket, { file: result });
            });
        });
    }
}

module.exports = ProjectGenerator;
