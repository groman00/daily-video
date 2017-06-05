const path = require('path');
const Preview = require('../Models/Preview');
const helpers = require('../helpers');
const io = require('../../io');

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
            .then((preview) => {
                if (!io().sockets.connected[helpers.getRenderSocketId()]) {
                    throw new Error('Render server is not connected.');
                }
                io().to(helpers.getRenderSocketId()).emit(
                    'createJob',
                    {
                        projectType: 'preview',
                        project: preview,
                        socketId: req.body.socket_id
                    }
                );
                res.send(JSON.stringify({
                    'previewId': preview._id
                }));
            })
            .catch((e) => {
                console.log(e);
                res.status(500).send(JSON.stringify({}));
            });
    }

}

module.exports = function (jobQueue) {
    return new PreviewController(jobQueue);
}
