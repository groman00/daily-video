const path = require('path');
const Project = require('../Models/Project');
const errorHandler = require('../Error/handler');
const appRoot = path.resolve(__dirname, '../../');

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
            format: body.format,
            title: body.title,
            slideshowId: body.slideshowId,
            slides: JSON.parse(body.slides),
            narration: JSON.parse(body.slideshowData).narration,
            audioTrack: body.audioTrack,
            audioTrackLevel: body.audioTrackLevel,
            videoDuration: body.videoDuration,
            preview: body.preview
        });
        return project.save();
    }

    save(req, res, next) {
        this.saveProject(req)
            .then(project => {
                res.end('success: ' + project._id);
            })
            .catch(e => errorHandler(e, res));
    }

    /**
     * Generate AEP for project and render to video file.
     */
    render(req, res, next) {
        this.saveProject(req)
            .then(project => {
                res.end('success');
                this.jobQueue.addProject(project, req.body.socket_id);
            })
            .catch(e => errorHandler(e, res));
    }

}

module.exports = function (jobQueue) {
    return new ProjectController(jobQueue);
}
