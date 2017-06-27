const path = require('path');
const Project = require('../Models/Project');
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
            data: body.slideshowData,
            // narrationTrack: req.file ? (appRoot + '/' + req.file.path) : (appRoot + '/public/fixtures/empty.mp3'),
            // narrationTrackLevel: body.narrationTrackLevel,

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
                this.jobQueue.addProject(project, req.body.socket_id);
                res.end('success')
            })
            .catch((e) => {
                console.log(e);
                res.end('fail');
            });
    }

}

module.exports = function (jobQueue) {
    return new ProjectController(jobQueue);
}
