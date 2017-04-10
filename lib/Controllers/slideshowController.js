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
    const crop = {
      h: Math.round(body.toCropImgH),
      w: Math.round(body.toCropImgW),
      x: Math.round(body.toCropImgX),
      y: Math.round(body.toCropImgY)
    };
    aws.upload(appRoot + '/' + req.file.path)
      .then((s3Data) => {
        // todo: delete uploaded file
        res.send({
          images: this.getImagesFromDims(s3Data.Location, crop),
          crop: crop
        });
      })
      .catch((e) => {
        console.log(e);
        res.send({});
      });
  }

  getImagesFromDims(image, crop) {
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
      image_url_large: image,
      image_url_thumb: dims.request(image, { thumbnail: [480, 270] }, 70)
    }

    // const imageLarge = dims.thumbnail(image, [1920, 1080], 90);
    // const imageThumb = dims.thumbnail(image, [480, 270], 70);
    // const imageOriginal = type === 'gif' ? image : imageLarge;
    // return {
    //   image: image,
    //   image_url_large: imageLarge,
    //   image_url_thumb: imageThumb
    // }
  }

  // getImagesFromDims(image, type = 'jpg') {
  //   const imageLarge = dims.thumbnail(image, [1920, 1080], 90);
  //   const imageThumb = dims.thumbnail(image, [480, 270], 70);
  //   const imageOriginal = type === 'gif' ? image : imageLarge;
  //   return {
  //     image: image,
  //     image_url_large: imageLarge,
  //     image_url_thumb: imageThumb
  //   }
  // }

  /**
   * Merge custom data into amp slide data
   */
  parseSlide(slideData) {
    //const images = this.getImagesFromDims(slideData.image_url_large, slideData.data.crop);
    // console.log(this.getImagesFromDims(slideData.image_url_large, slideData.data.crop))
    const slide = new Slide(Object.assign(
      pick(slideData, ['id', 'credit', 'type', 'image_type', 'data', 'published']),
      {
        title: striptags(slideData.title),
        caption: striptags(slideData.caption)
        //,
        //image: data.image_url_large
      }
    ));

    return Object.assign(slide, this.getImagesFromDims(slideData.image_url_large), slide.data.crop);

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
