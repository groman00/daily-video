const fs = require('fs');
const path = require('path');
const async = require('async');
const chokidar = require('chokidar');
const helpers = require('../helpers');
const Preview = require('../Models/Preview');
const appRoot = path.resolve(__dirname, '../../');
const aws = require('../Services/aws');

class PreviewGenerator {

    constructor(jobQueue) {
        this.jobQueue = jobQueue;
    }

    /**
     * Generate AEP file from project data
     */
    generate(job, socket) {
        const id = job.previewId;
        const dir = `${appRoot}/temp/${id}`;
        const exportDir = `${appRoot}/public/exports/preview_${id}/`;
        let ae;

        Preview.findById(id, (err, preview) => {
            async.waterfall([
                (callback) => {
                    console.log("running ae script for preview");
                    helpers.emit(socket, ['progress', { message: 'Generating Preview' }]);
                    ae = helpers.runAeScriptFile('SlidePreview', id);
                    ae.on('close', (code) => {
                        this.jobQueue.jobComplete(job);
                        callback(null);
                    });
                },
                (callback) => {
                    fs.readdir(exportDir, (e, files) => {
                        callback(null, files);
                    });
                }
            ], (e, files) => {
                helpers.clearFiles([dir + '/**']);
                Preview.findByIdAndRemove(id, () => {});
                if (e) {
                    console.log('Error running job', e);
                    helpers.emit(socket, ['preview-error']);
                    this.jobQueue.jobComplete(job);
                    return false;
                }

                aws.uploadDir(exportDir, 'previews/' + id)
                    .then( () => {
                        console.log('job complete')
                        for (var i = 0; i < files.length; i++) {
                            files[i] = 'https://alpha-global-origin.s3.amazonaws.com/daily-video/previews/' + id + '/' + files[i];
                        }
                        console.log(files);
                        helpers.emit(socket, ['progress', { progress: 0, message: '' }]);
                        helpers.emit(socket, ['preview-ready', {
                            'files': files,
                            'previewId': preview._id
                        }]);
                    })
                    .catch((err) => {
                        console.log(err);
                        helpers.emit(socket, ['jobError', err.toString()]);
                        this.jobQueue.jobComplete(job);
                        return false;
                    });


            });

        });

    }

}

module.exports = PreviewGenerator;
