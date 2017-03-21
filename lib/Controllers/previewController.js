const path = require('path');
// const Project = require('../Models/Project');
// const Job = require('../Models/Job');
const appRoot = path.resolve(__dirname, '../../');

class PreviewController {

  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  /**
   */
  render(req, res, next) {

    // this.jobQueue.addProjectJob({
    //   projectId: project._id,
    //   socketId: req.body.socketId
    // });

    // res.end('success')

    // res.end('fail');

  }

}

module.exports = function (jobQueue) {
  return new PreviewController(jobQueue);
}
