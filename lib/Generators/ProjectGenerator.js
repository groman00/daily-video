const path = require('path');
const async = require('async');
const helpers = require('../helpers');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');
const io = require('../../io');

class ProjectGenerator {

  constructor(jobQueue) {
      this.jobQueue = jobQueue;
  }

  /**
   * Generate AEP file from project data
   */
  generate(job) {
    const id = job.projectId;
    const dir = `${appRoot}/temp/${id}`;
    const socket = io().sockets.connected[job.socketId];
    const exportedFile = `${appRoot}/public/exports/DailyVideo_${id}.mov`;
    let ae;

    Project.findById(id, (err, project) => {
      async.waterfall([
        (callback) => {
          console.log('Running AE Script');
          helpers.emit(socket, ['progress', { message: 'Generating Project' }]);
          // callback('Error');
          // return false
          ae = helpers.runAeScriptFile('DailyVideo', id);
          ae.on('close', (code) => {
            this.jobQueue.jobComplete(job);
            callback(null);
          });
        },
        (callback) => {
          // callback(null);
          // return false;
          ae = helpers.runAeRender({
            project: `${dir}/aep/DailyVideo.aep`,
            comp: `Master_${id}`,
            rsTemplate: (project.preview ? 'Low_Res' : 'Best Settings'),
            output: exportedFile
          });
          ae.stdout.on('data', (data) => {
            // [ 'PROGRESS:', '', '0:00:05:18', '(169):', '0', 'Seconds\n' ]
            // console.log(data);
            let progress = (parseInt(data.toString().split(' (')[1]) / 30) / project.videoDuration;
            if (!isNaN(progress)) {
              // console.log(progress);
              helpers.emit(socket, ['progress', {
                progress: progress,
                message: 'Rendering'
              }]);
            }
          });
          ae.on('close', (code) => {
              callback(null);
          });
        }
      ], (err, result) => {
        helpers.clearFiles([dir + '/**']);
        Project.findByIdAndRemove(id, () => {});
        // [dir + '/**', __dirname + '/../uploads/audio' + name + '.mp3']
        if (err) {
          console.log('Error running job', err);
          helpers.emit(socket, ['jobError', err.toString()]);
          this.jobQueue.jobComplete(job);
          return false;
        }
        console.log('job complete')
        helpers.emit(socket, ['complete', {
          file: '/exports/' + exportedFile.split('/').pop()
        }]);
      });
    });

  }
}

module.exports = ProjectGenerator;
