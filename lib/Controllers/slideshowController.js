const fs = require('fs');
const path = require('path');
const pick = require('lodash.pick');
const striptags = require('striptags');
const request = require('request');
const del = require('del');
const config = require('../config');
const amp = require('../Services/amp');
const dims = require('../Services/dims');
const aws = require('../Services/aws');
const Slide = require('../Models/Slide');
const appRoot = path.resolve(__dirname, '../../');

class slideshowController {

    constructor(jobQueue) {}

    /**
     */
    create(req, res, next) {
        amp.slideshows.create(996)
            .then((slideshow) => {
                res.send(slideshow);
            })
            .catch((e) => {
                res.status(400).send(e);
            });
    }

    save(req, res, next) {
        amp.slideshows.update(req.body)
            .then((slideshow) => {
                res.send(slideshow);
            })
            .catch((e) => {
                res.status(400).send(e);
            });
    }

    /**
     */
    all(req, res, next) {
        amp.slideshows.query([996], req.params.page)
            .then((slideshows) => {
                res.send(slideshows);
            })
            .catch((e) => {
                res.send(e)
            });
    }

    /**
     */
    one(req, res, next) {
        const projectConfig = config();
        amp.slideshows.get(req.params.id)
            .then((slideshow) => {
                res.send({
                    'slideshow': this.parseSlideshow(slideshow, projectConfig.templates),
                    'config': projectConfig
                })
            })
            .catch((e) => {
                res.send(e)
            });
    }

    /**/
    addSlide(req, res, next) {
        amp.slides.create(req.body.slideshow_id)
            .then((slide) => {
                // Work around slide order issue in amp api
                // send new slide and entire slideshow, and let the FE figure out where it was inserted
                amp.slideshows.get(req.body.slideshow_id)
                    .then((slideshow) => {
                        res.send({
                            'slideshow': slideshow,
                            'slide': this.parseSlide(slide)
                        })
                    })
                    .catch((e) => {
                        res.send(e)
                    });
            })
            .catch((e) => {
                console.log(e);
                res.status(400).send(e);
            });
    }

    /**/
    saveSlide(req, res, next) {
        amp.slides.update(req.body)
            .then((slide) => {
                res.send(this.parseSlide(slide));
            })
            .catch((e) => {
                console.log(e);
                res.status(400).send(e);
            });
    }

    /**/
    moveSlide(req, res, next) {
        amp.slides.move(req.body.slideshowId, req.body.slideId, req.body.index)
            .then((response) => {
                res.send({});
            });
    }

    /**/
    deleteSlide(req, res, next) {
        amp.slides.delete(req.body)
            .then(() => {
                res.send({});
            })
            .catch((e) => {
                console.log(e);
                res.status(400).send(e);
            });
    }

    /**
     */
    imageUpload(req, res, next) {
        const crop = JSON.parse(req.body.crop);
        this.fileUpload(req, res, 'images', s3Data => {
            res.send({
                images: this.getImagesFromDims(s3Data.Location, s3Data.Key.split('.').pop(), crop),
                crop: crop
            });
        });
    }

    /**
     */
    videoUpload(req, res, next) {
        this.fileUpload(req, res, 'videos', s3Data => {
            res.send({
                source: s3Data.Location
            });
        });
    }

    /**
     */
    audioUpload(req, res, next) {
        this.fileUpload(req, res, 'audio', s3Data => {
            res.send({
                name: req.file.originalname,
                file: s3Data.Location
            });
        });
    }

    /**
     * Upload File to AWS
     * @param  {Object} req
     * @param  {Object} res
     * @param  {String} folder
     * @return {void}
     */
    fileUpload(req, res, folder, callback) {
        const file = `${appRoot}/${req.file.path.toLowerCase()}`;
        aws.upload(file, folder)
            .then(s3Data => {
                del([file], { force: true });
                callback.apply(null, [s3Data]);
            })
            .catch(e => {
                res.status(500).send(e);
            });
    }

    /**
     * [getImagesFromDims description]
     */
    getImagesFromDims(image, type, crop) {
        if (crop) {
            return {
                image: image,
                image_url_large: dims.request(image, {
                    crop: [crop.w, crop.h, crop.x, crop.y],
                    resize: [1920, 1080]
                }, 90),
                image_url_thumb: dims.request(image, {
                    crop: [crop.w, crop.h, crop.x, crop.y],
                    resize: [480, 270]
                }, 70)
            }
        }
        return {
            image: image,
            image_url_large: (type === 'gif') ? image : dims.request(image, { thumbnail: [1920, 1080] }, 90),
            image_url_thumb: dims.request(image, { thumbnail: [480, 270] }, 70)
        }
    }

    /**
     * Merge custom data into amp slide data
     */
    parseSlide(slideData) {
        const slide = new Slide(Object.assign(
            pick(slideData, ['id', 'credit', 'type', 'image_type', 'data', 'published']),
            {
                title: striptags(slideData.title),
                caption: striptags(slideData.caption)
            }
        ));
        return Object.assign(slide, this.getImagesFromDims(slideData.image_url_large, slide.image_type, slide.data.crop));
    }

    /**
     * Clean up slideshow response and take only the data we need
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    parseSlideshow(data, templates) {
        const slideshow = pick(data, ['id', 'site_id', 'title', 'slug', 'published', 'data']);
        let slide, images, type;
        slideshow.data = slideshow.data || {};
        slideshow.image = data.image_url_thumb;
        slideshow.slides = data.slides.map((slideData) => {
            return this.parseSlide(slideData);
        });
        return slideshow;
    }

}

module.exports = function () {
    return new slideshowController();
}
