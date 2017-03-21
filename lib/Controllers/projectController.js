const Project = require('../Models/Project');
// const Job = require('../Models/Job');

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
    this.saveProject({
      slideshowId: req.body.slideshowId,
      slides: req.body.slides
    })
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
    this.saveProject({
      slideshowId: req.body.slideshowId,
      slides: req.body.slides
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
