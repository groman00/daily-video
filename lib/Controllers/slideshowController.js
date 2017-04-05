const fs = require('fs');
const path = require('path');
const pick = require('lodash.pick');
const striptags = require('striptags');
const request = require('request');
const amp = require('../Services/amp');
const dims = require('../Services/dims');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');

class slideshowController {

  constructor(jobQueue) {}

  create(req, res, next) {
    /*amp.slideshows.create()
      .then((d) => {
        res.send(d);
      })
      .catch((e) => {
        res.send(e)
      });*/

    // res.send(dims.thumbnail('https://s.blogcdn.com/slideshows/images/slides/494/870/1/S4948701/slug/l/us-president-barack-obama-and-his-daughter-malia-obama-walk-1.jpg', [480, 270], 70));
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
    fs.readFile(appRoot + '/resources/json/config.json', (configError, config) => {
      if (configError) {
        res.send({});
        return;
      }
      config = JSON.parse(config);
      config.templates = config.templates.reduce(function (acc, template) {
        acc[template.name] = template;
        return acc;
      }, {});
      amp.slideshows.get(req.params.id)
        .then((slideshow) => {
          res.send({
            'slideshow': this.parseSlideshow(slideshow, config.templates),
            'config': config
          })
        })
        .catch((e) => {
          res.send(e)
        });
    });
  }

  /**
   * Clean up slideshow response and take only the data we need
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  parseSlideshow(data, templates) {
    const slideshow = pick(data, ['id', 'site_id', 'title', 'slug', 'published']);
    let slide, type;
    slideshow.image = data.image_url_thumb;
    slideshow.slides = data.slides
      // .filter((slide) => {
      //   if (!slide.template) {
      //     return true;
      //   }
      //   return !/^date$|^bumper$|^bumper\_joke$|^share$/.test(slide.template.name);
      // })
      .map((slideData) => {
        slide = pick(slideData, ['id', 'credit', 'type', 'image_type', 'data', 'metadata', 'published']);
        slide.title = striptags(slideData.title);
        slide.caption = striptags(slideData.caption);
        slide.image_url_large = dims.thumbnail(slideData.image_url_large, [1920, 1080], 90);
        slide.image_url_thumb = dims.thumbnail(slideData.image_url_thumb, [480, 270], 70);
        slide.image = slide.image_type === 'gif' ? slideData.original_image : slide.image_url_large;

        // The following would be either "data" or "metadata"
        slide.bumper = slideData.bumper || false;
        switch (slide.type) {
            case 'quote':
                type = 'quote';
                break;
            case 'text':
                type = 'title_1';
                break;
            default:
                type = 'slide_in_out';
        }
        slide.template = templates[type];
        return slide;
      });
    return slideshow;
  }

}

module.exports = function () {
  return new slideshowController();
}
