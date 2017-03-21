const Job = require('./Models/Job');
const ProjectGenerator = require('./Generators/ProjectGenerator');
const PreviewGenerator = require('./Generators/PreviewGenerator');

class JobQueue {

  /**
   */
  constructor() {
    this.projectGenerator = new ProjectGenerator(this);
    this.previewGenerator = new PreviewGenerator(this);
    this.activeJob = null;
  }

  /**
   */
  addJob(data) {
    (new Job(data)).save((e, job) => {
      if (e) {
        // handle error
      }
      if (this.activeJob === null) {
        this.runJob(job);
      }
    });
  }

  /**
   */
  runJob(job) {
    this.activeJob = job;

    // Is there a cleaner way to figure out which generator to use?
    if (job.projectId) {
      this.projectGenerator.generate(job);
    } else {
      this.previewGenerator.generate(job);
    }
  }

  /**
   */
  jobComplete(job) {
    Job.findByIdAndRemove(job._id, () => {
      Job.findOne({}, null, { 'sort': { 'timestamp': 1 } }, (e, job) => {
        if (job) {
          this.runJob(job);
        } else {
          this.activeJob = null;
          console.log('job queue empty');
        }
      });
    });
  }

}

module.exports = new JobQueue();
