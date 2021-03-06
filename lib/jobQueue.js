const path = require('path');
const async = require('async');
const Job = require('./Models/Job');
const ProjectGenerator = require('./Generators/ProjectGenerator');
const PreviewGenerator = require('./Generators/PreviewGenerator');
const appRoot = path.resolve(__dirname, '../');
const helpers = require('./helpers');
const io = require('../io');
const JobQueueError = require('./Error/JobQueue');
const errorHandler = require('./Error/handler');
const progressResponse = require('./Responses/progress');

class JobQueue {

    /**
     */
    constructor() {
        this.projectGenerator = new ProjectGenerator(this);
        this.previewGenerator = new PreviewGenerator(this);
        this.activeJob = null;
    }

    /**
     * Create temp folders/files for this job
     * @param  {Object} videoData
     * @param  {Object} socket
     * @param  {String} dir
     * @return {Promise}
     */
    createTempFiles(model, socket, dir) {
        const slides = model.slides || [model.slide];
        return new Promise((resolve, reject) => {
            async.waterfall([
                (callback) => {
                    console.log('creating temp dirs');
                    helpers.createTempDirs(dir)
                        .then(dirs => {
                            callback(null, dirs);
                        })
                        .catch(e => {
                            callback(e);
                        });
                },
                (dirs, callback) => {
                    try {
                        progressResponse(socket, { progress: 0, message: 'Downloading Assets' });
                        if (!model.narration || !model.narration.file) {
                            callback(null, dirs);
                            return;
                        }
                        console.log('Downloading Audio');
                        const narrationFile = `${dirs.audio}${model.narration.name}`
                        helpers.download(model.narration.file, narrationFile, () => {
                            model.narration.file = narrationFile;
                            callback(null, dirs);
                        });
                    } catch (e) {
                        callback(e);
                    }
                },
                (dirs, callback) => {
                    console.log('Downloading Images/Video');
                    helpers.downloadSlides(socket, dirs, slides, callback);
                },
                (dirs, callback) => {
                    console.log('Writing Project Config');
                    helpers.writeFile(dirs.json + 'config.json', model, callback);
                }
            ], (e, result) => {
                if (e) {
                    reject(new JobQueueError(e.message, model.type));
                    return false;
                }
                resolve();
            });
        });
    }

    /**
     */
    addProject(project, socketId) {
        this.addJob(project, {
            type: 'project',
            projectId: project._id,
            socketId: socketId
        });
    }

    /**
     */
    addPreview(preview, socketId) {
        this.addJob(preview, {
            type: 'preview',
            previewId: preview._id,
            socketId: socketId
        });
    }

    /**
     * Save project assets before adding to job queue
     * This frees up the job queue to only handle jobs that are ready to compile
     * @param {Object} model
     * @param {Object} jobData
     */
    addJob(model, jobData) {
        const socket = io().sockets.connected[jobData.socketId];
        const dir = `${appRoot}/temp/${model._id}`;
        this.createTempFiles(model, socket, dir)
            .then(() => {
                console.log('temp files downloaded')
                this.queueJob(new Job(jobData), socket);
            })
            .catch(e => {
                errorHandler(e, socket);
                // Delete saved data and files
                model.remove(() => {
                    helpers.clearFiles([dir + '/**']);
                });
            });
    }

    /**
     * Added Job to queue
     * @param  {Object} model
     * @param  {Object} socket
     */
    queueJob(model, socket) {
        model.save((saveError, job) => {
            if (saveError) {
                errorHandler(new JobQueueError(saveError.message, model.type), socket);
            }
            Job.count({}, (countError, count) => {
                if (!countError) {
                    progressResponse(socket, { message: `Render Queue Position: ${count}` });
                }
            });
            if (this.activeJob === null) {
                this.runJob(job);
            }
        });
    }

    /**
     */
    runJob(job) {
        try {
            this.activeJob = job;
            this[`${job.type}Generator`].generate(job);
        } catch (e) {
            errorHandler(new JobQueueError(e.message, job.type), io().sockets.connected[job.socketId]);
        }
    }

    /**
     */
    jobComplete(job) {
        Job.findByIdAndRemove(job._id, () => {
            Job.findOne({}, null, { 'sort': { 'timestamp': 1 } }, (e, job) => {
                if (job) {
                    this.runJob(job);
                } else {
                    this.activeJob = null;
                    console.log('job queue empty');
                }
            });
        });
    }

}

module.exports = new JobQueue();
