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
    const narrationTrack = req.file ? (appRoot + '/' + req.file.path) : (appRoot + '/public/fixtures/empty.mp3');
    const project = {
      title: body.title,
      slideshowId: body.slideshowId,
      slides: JSON.parse(body.slides),
      narrationTrack: narrationTrack,
      narrationTrackLevel: body.narrationTrackLevel,
      audioTrack: body.audioTrack,
      audioTrackLevel: body.audioTrackLevel,
      videoDuration: body.videoDuration,
      preview: body.preview
    };
    return Project.findOneAndUpdate({ slideshowId: project.slideshowId }, project, { upsert: true, new: true });
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
    // var socket = getSocketById(req, req.body.socket_id);

    this.saveProject(req)
      .then((project) => {
        this.jobQueue.addJob({
          projectId: project._id,
          socketId: req.body.socket_id
        });
        res.end('success')
      })
      .catch(() => {
        res.end('fail');
      });
  }

}

module.exports = function (jobQueue) {
  return new ProjectController(jobQueue);
}
