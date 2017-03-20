const Project = require('../Models/Project');
const Job = require('../Models/Job');

class ProjectController {

  constructor() {}

  /**
   * Save project to db
   */
  save(req, res, next) {
    const slideshowId = req.body.slideshowId;
    const slides = req.body.slides;
    let project = {
      slideshowId: slideshowId,
      slides: slides
    };
    Project.findOneAndUpdate({ slideshowId: slideshowId }, project, { upsert: true, new: true }, (err) => {
      if (err) {
        res.end('error saving project');
      }
      res.end('project saved')
    });
  }

  /**
   * Generate AEP for project and render to video file.
   */
  render(req, res, next) {
    (new Job()).save((err, job) => {
      if (err) {
        // handle error
      }
      console.log('job', job)
      res.end('')
    });
  }

}

module.exports = new ProjectController();
