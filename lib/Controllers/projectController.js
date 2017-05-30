const path = require('path');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');
const io = require('../../io');
const helpers = require('../helpers');

class ProjectController {

    constructor(jobQueue) {
        this.jobQueue = jobQueue;
    }

    /**
     * Save project to db
     */
    saveProject(req) {
        const body = req.body;
        var project = new Project({
            theme: body.theme,
            title: body.title,
            slideshowId: body.slideshowId,
            slides: JSON.parse(body.slides),
            narrationTrack: req.file ? (appRoot + '/' + req.file.path) : (appRoot + '/public/fixtures/empty.mp3'),
            narrationTrackLevel: body.narrationTrackLevel,
            audioTrack: body.audioTrack,
            audioTrackLevel: body.audioTrackLevel,
            videoDuration: body.videoDuration,
            preview: body.preview
        });
        return project.save();
    }

    save(req, res, next) {
        this.saveProject(req)
            .then((project) => {
                res.end('success: ' + project._id);
            })
            .catch(() => {
                res.end('fail');
            });
    }

    /**
     * Generate AEP for project and render to video file.
     */
    render(req, res, next) {
        this.saveProject(req)
            .then((project) => {
                if (io().sockets.connected[helpers.getRenderSocketId()] == undefined) {
                    throw new Error('Render server is not connected.');
                }
                io().to(helpers.getRenderSocketId()).emit(
                    'createJob',
                    {
                        projectType: 'project',
                        project: project,
                        socketId: req.body.socket_id
                    }
                );
                res.end('success')
            })
            .catch(() => {
                res.status(500).end('fail');
            });
    }

}

module.exports = function (jobQueue) {
    return new ProjectController(jobQueue);
}
