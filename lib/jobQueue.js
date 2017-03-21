// const Job = require('./Models/Job');
const ProjectJob = require('./Models/ProjectJob');
const ProjectGenerator = require('./Generators/ProjectGenerator');

class JobQueue {

  constructor() {
    // this.projectQueue = [];
    // this.renderQueue = [];
    this.projectGenerator = new ProjectGenerator(this);
    this.activeProjectJob = null;
  }

  addProjectJob(data) {

    // Maybe there should be to collections to handle job queue and render queue?

    (new ProjectJob(data)).save((e, job) => {
      if (e) {
        // handle error
      }

      if (this.activeProjectJob === null) {
        this.runProjectJob(job);
      }

      // this.projectQueue.push(job);
      // this.projectGenerator.generate(job);
      // Immediately fire generator if there are no others running
      // if (this.projectQueue.length === 1) {
      //   this.runProjectFromQueue();
      // }

    });
  }

  runProjectJob(job) {
    this.activeProjectJob = job;
    this.projectGenerator.generate(job);

    /*
    ProjectJob.findOne({}, null, { 'sort': { 'timestamp': 1 } }, (e, job) => {
      if (job) {
        this.activeProjectJob = job;
        this.projectGenerator.generate(job);
      } else {
        this.activeProjectJob = null;
        console.log('project job queue empty');
      }
    });
    */


  }

  /**
   * Remove current Project Job and fire off the next one
   * @param  {[type]} job [description]
   * @return {[type]}     [description]
   */
  projectJobComplete(job) {
    ProjectJob.findByIdAndRemove(job._id, () => {

      // todo: Run Render Job here
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

  // runProjectFromQueue() {
  //   if (this.projectQueue.length) {
  //     console.log('running next project in queue');
  //     this.projectGenerator.generate(this.projectQueue[0]);
  //   } else {
  //     console.log('no jobs queued');
  //   }
  // }

  // removeProjectFromQueue() {
  //   console.log('Removing project from queue');
  //   this.projectQueue.shift();
  //   this.runProjectFromQueue();
  // }

}

module.exports = new JobQueue();
