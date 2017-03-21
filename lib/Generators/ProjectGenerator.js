const path = require('path');
const async = require('async');
const helpers = require('../helpers');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');

class ProjectGenerator {

  constructor(jobQueue) {
      this.jobQueue = jobQueue;
  }

  /**
   * Generate AEP file from project data
   */
  generate(job) {
    const id = job._id;
    const dir = appRoot + '/temp/' + id;
    let tempDirs;
    let ae;

    Project.findById(job.projectId, (err, project) => {

      async.waterfall([

        (callback) => {
          console.log('creating temp dirs');
          helpers.createTempDirs(dir, callback);
        },

        (dirs, callback) => {
          console.log('Downloading Images');
          tempDirs = dirs;
          helpers.downloadSlides(tempDirs.images, project.slides, callback);
        },

        (callback) => {
          console.log('Writing Project Config');
          helpers.writeFile(tempDirs.json + 'config.json', project, callback);
        },

        (callback) => {
          console.log('Running AE Script');
          ae = helpers.runAeScriptFile('DailyVideo', id);
          ae.on('close', (code) => {
            this.jobQueue.jobComplete(job);
            callback(null);
          });
        },

        (callback) => {
          ae = helpers.runAeRender({
            project: tempDirs.aep + 'DailyVideo.aep',
            comp: 'Master_' + id,
            rsTemplate: (project.preview ? 'Low_Res' : 'Best Settings'),
            output: appRoot + '/public/exports/DailyVideo_' + id + '.mov'
          });
          ae.stdout.on('data', (data) => {
            // Terrible progress indication...
            // [ 'PROGRESS:', '', '0:00:05:18', '(169):', '0', 'Seconds\n' ]
            // console.log(data);
            let progress = (parseInt(data.toString().split(' (')[1]) / 30) / project.videoDuration;
            if (!isNaN(progress)) {
              console.log(progress);
              // socket.emit('progress', {
              //   progress: progress,
              //   message: 'Rendering'
              // });
            }
          });
          ae.on('close', (code) => {
              callback(null);
          });
        }

      ], (err, result) => {
        helpers.clearFiles([dir + '/**']);
        //[dir + '/**', __dirname + '/../uploads/audio' + name + '.mp3']
        //
        if (err) {
          console.log('Error running job', err);
          return false;
        }
        console.log('job complete')
      });

    });

  }
}

module.exports = ProjectGenerator;
