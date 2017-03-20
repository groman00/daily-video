const Job = require('./Models/Job');
const ProjectGenerator = require('./Generators/ProjectGenerator');

class JobQueue {

  constructor() {
    this.queue = [];
    this.projectGenerator = new ProjectGenerator(this);
  }

  add(data) {
    (new Job(data)).save((e, job) => {
      if (e) {
        // handle error
      }
      this.projectGenerator.generate(job);
    });
  }

}

module.exports = new JobQueue();
