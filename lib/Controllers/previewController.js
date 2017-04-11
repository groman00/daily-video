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
  savePreview(body) {
    const preview = new Preview({
      slide: body.slide,
      theme: body.theme
    });
    return preview.save();
  }

  /**
   */
  render(req, res, next) {
    this.savePreview(req.body)
      .then((preview) => {
        this.jobQueue.addJob({
          previewId: preview._id,
          socketId: req.body.socket_id
        });
        res.send(JSON.stringify({
          'previewId': preview._id
        }));
      })
      .catch(() => {
        res.send(JSON.stringify({}));
      });
  }

}

module.exports = function (jobQueue) {
  return new PreviewController(jobQueue);
}
