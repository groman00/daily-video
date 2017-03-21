const ProjectJob = require('./Models/ProjectJob');
const ProjectGenerator = require('./Generators/ProjectGenerator');

class JobQueue {

  /**
   */
  constructor() {
    this.projectGenerator = new ProjectGenerator(this);
    this.activeProjectJob = null;
  }

  /**
   */
  addProjectJob(data) {
    (new ProjectJob(data)).save((e, job) => {
      if (e) {
        // handle error
      }
      if (this.activeProjectJob === null) {
        this.runProjectJob(job);
      }
    });
  }

  /**
   */
  runProjectJob(job) {
    this.activeProjectJob = job;
    this.projectGenerator.generate(job);
  }

  /**
   */
  projectJobComplete(job) {
    ProjectJob.findByIdAndRemove(job._id, () => {
      ProjectJob.findOne({}, null, { 'sort': { 'timestamp': 1 } }, (e, job) => {
        if (job) {
          this.runProjectJob(job);
        } else {
          this.activeProjectJob = null;
          console.log('project job queue empty');
        }
      });
    });
  }

}

module.exports = new JobQueue();
