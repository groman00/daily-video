const Job = require('./Models/Job');
const ProjectGenerator = require('./Generators/ProjectGenerator');
const PreviewGenerator = require('./Generators/PreviewGenerator');
const helpers = require('./helpers');
const io = require('../io');

class JobQueue {

  /**
   */
  constructor() {
    this.projectGenerator = new ProjectGenerator(this);
    this.previewGenerator = new PreviewGenerator(this);
    this.activeJob = null;
  }

  /**
   * Prepare Job for queue
   * @param {Object} project
   * @param {String} socketId
   */
  addJob(project, socketId) {

    // Save project assets before adding to job queue
    // This frees up the job queue to only handle jobs that are ready to compile
    const socket = io().sockets.connected[socketId];
    this.projectGenerator.createTempFiles(project, socket)
      .then(() => {
        console.log('temp files downloaded')
        this.queueJob(new Job({
          'projectId': project._id,
          'socketId': socketId
        }), socket);
      })
      .catch((e) => {
        console.log('Error downloading files', e);

        // todo: Project and files should be removed here
        helpers.emit(socket, ['jobError', 'Error downloading assets']);
      });
  }

  /**
   * Added Job to queue
   * @param  {Object} model
   * @param  {Object} socket
   */
  queueJob(model, socket) {

    model.save((saveError, job) => {
      if (saveError) {
        // handle error
      }
      Job.count({}, (countError, count) => {
        if (!countError) {
          helpers.emit(socket, ['progress', { message: 'Render Queue Position: ' + count }]);
        }
      });
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
