const path = require('path');
const Preview = require('../Models/Preview');
const appRoot = path.resolve(__dirname, '../../');
const errorHandler = require('../Error/handler');

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
            theme: body.theme,
            format: body.format
        });
        return preview.save();
    }

    /**
     */
    render(req, res, next) {
        this.savePreview(req.body)
            .then(preview => {
                res.send(JSON.stringify({
                    'previewId': preview._id
                }));
                this.jobQueue.addPreview(preview, req.body.socket_id);
            })
            .catch(e => errorHandler(e, res));
    }

}

module.exports = jobQueue => {
    return new PreviewController(jobQueue);
}
