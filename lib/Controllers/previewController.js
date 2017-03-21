const path = require('path');
const Preview = require('../Models/Preview');
const appRoot = path.resolve(__dirname, '../../');

class PreviewController {

  /**
   */
  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  /**
   * Save preview to db
   */
  savePreview(req) {
    const preview = new Preview({
      slide: req.body.slide
    });
    return preview.save();
  }

  /**
   */
  render(req, res, next) {
    this.savePreview(req)
      .then((preview) => {
        this.jobQueue.addJob({
          previewId: preview._id,
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
  return new PreviewController(jobQueue);
}
