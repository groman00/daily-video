const fs = require('fs');
const path = require('path');
const pick = require('lodash.pick');
const striptags = require('striptags');
const request = require('request');
const config = require('../config');
const amp = require('../Services/amp');
const dims = require('../Services/dims');
const aws = require('../Services/aws');
const Project = require('../Models/Project');
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
    amp.slideshows.query([996])
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
        res.send(this.parseSlide(slide));
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
    const body = req.body;
    aws.upload(appRoot + '/' + req.file.path)
      .then((s3Data) => {
        res.send({
          image: dims.crop(s3Data.Location, [Math.round(body.toCropImgW), Math.round(body.toCropImgH), Math.round(body.toCropImgX), Math.round(body.toCropImgY)])
        });
        res.send('file done')
      })
      .catch((e) => {
        console.log(e);
        res.send({});
      });
  }

  /**
   * Merge custom data into amp slide data
   */
  parseSlide(data) {
    const images = {
      large: dims.thumbnail(data.image_url_large, [1920, 1080], 90),
      thumb: dims.thumbnail(data.image_url_thumb, [480, 270], 70)
    };
    return new Slide(Object.assign(
      pick(data, ['id', 'credit', 'type', 'image_type', 'data', 'published']),
      {
        title: striptags(data.title),
        caption: striptags(data.caption),
        image_url_large: images.large,
        image_url_thumb: images.thumb,
        image: data.image_type === 'gif' ? data.original_image : images.large
      }
    ));
  }

  /**
   * Clean up slideshow response and take only the data we need
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  parseSlideshow(data, templates) {
    const slideshow = pick(data, ['id', 'site_id', 'title', 'slug', 'published']);
    let slide, images, type;
    slideshow.image = data.image_url_thumb;
    slideshow.slides = data.slides
      .map((slideData) => {
        return this.parseSlide(slideData);
      });
    return slideshow;
  }

}

module.exports = function () {
  return new slideshowController();
}
