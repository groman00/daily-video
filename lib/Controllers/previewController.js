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
        // const preview = new Preview({
        //     slide: body.slide,
        //     theme: body.theme,
        //     format: body.format
        // });
        // return preview.save();

        return new Promise((resolve, reject) => {
            if (false) {
                resolve();
            }
            reject(new Error('something got foo barred'));
        });
    }

    /**
     */
    render(req, res, next) {
        this.savePreview(req.body)
            .then((preview) => {
                this.jobQueue.addPreview(preview, req.body.socket_id);
                res.send(JSON.stringify({
                    'previewId': preview._id
                }));
            })
            .catch(e => {
                errorHandler(e);
                // res.send(JSON.stringify({}));
            });
    }

}

module.exports = function (jobQueue) {
    return new PreviewController(jobQueue);
}
