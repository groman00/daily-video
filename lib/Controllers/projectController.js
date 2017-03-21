const path = require('path');
const Project = require('../Models/Project');
// const Job = require('../Models/Job');
const appRoot = path.resolve(__dirname, '../../');

class ProjectController {

  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  /**
   * Save project to db
   */
  saveProject(project) {
    return Project.findOneAndUpdate({ slideshowId: project.slideshowId }, project, { upsert: true, new: true });
  }

  save(req, res, next) {
    /*this.saveProject({
      slideshowId: req.body.slideshowId,
      slides: req.body.slides
    })
    .then((project) => {
      res.end('success: ' + project._id);
    })
    .catch(() => {
      res.end('fail');
    });*/
    res.end('disabled');
  }

  /**
   * Generate AEP for project and render to video file.
   */
  render(req, res, next) {
    const body = req.body;
    const narrationTrack = req.file ? (appRoot + '/' + req.file.path) : (appRoot + '/public/fixtures/empty.mp3');

    // var socket = getSocketById(req, req.body.socket_id);

    this.saveProject({
      slideshowId: body.slideshowId,
      slides: JSON.parse(body.slides),
      narrationTrack: narrationTrack,
      narrationTrackLevel: body.narrationTrackLevel,
      audioTrack: body.audioTrack,
      audioTrackLevel: body.audioTrackLevel,
      videoDuration: body.videoDuration,
      preview: body.preview
    })
    .then((project) => {
      this.jobQueue.addProjectJob({
        projectId: project._id,
        socketId: req.body.socketId
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
