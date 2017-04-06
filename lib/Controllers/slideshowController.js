const fs = require('fs');
const path = require('path');
const pick = require('lodash.pick');
const striptags = require('striptags');
const request = require('request');
const config = require('../config');
const amp = require('../Services/amp');
const dims = require('../Services/dims');
const Project = require('../Models/Project');
const Slide = require('../Models/Slide');
const appRoot = path.resolve(__dirname, '../../');

class slideshowController {

  constructor(jobQueue) {}

  create(req, res, next) {
    amp.slideshows.create(996)
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
        images = {
          large: dims.thumbnail(slideData.image_url_large, [1920, 1080], 90),
          thumb: dims.thumbnail(slideData.image_url_thumb, [480, 270], 70)
        };
        slide = new Slide(Object.assign(
          pick(slideData, ['id', 'credit', 'type', 'image_type', 'metadata', 'published']),
          {
            title: striptags(slideData.title),
            caption: striptags(slideData.caption),
            image_url_large: images.large,
            image_url_thumb: images.thumb,
            image: slideData.image_type === 'gif' ? slideData.original_image : images.large
          }
        ));
        return slide;
      });
    return slideshow;
  }

}

module.exports = function () {
  return new slideshowController();
}
