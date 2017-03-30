const fs = require('fs');
const path = require('path');
const request = require('request');
const Project = require('../Models/Project');
const appRoot = path.resolve(__dirname, '../../');

class slideshowController {

  /**
   */
  constructor(jobQueue) {
    this.url = 'http://alpha.aol.com';
  }

  /**
   */
  fetchRemoteSlideshow(id) {
    const options = {
      url: 'http://alpha.aol.com/slideshow-json/' + id
    };
    let data;
    return new Promise((resolve, reject) => {
      request(options, (e, response, body) => {
        if (e) {
          reject({});
          return;
        }
        resolve(JSON.parse(body));
      });
    });
  }

  /**
   */
  all(req, res, next) {
    let data;
    const options = {
      url: this.url + '/slideshows-json?site_id=996'
    };
    request(options, function (error, response, body) {
      res.send(JSON.parse(body));
    });
  }

  /**
   */
  one(req, res, next) {
    let data;
    const id = req.params.id;
    // Should we keep config in mongodb?
    fs.readFile(appRoot + '/resources/json/config.json', (configError, config) => {
      if (configError) {
        res.send({});
        return;
      }
      config = JSON.parse(config);
      Project.findOne({ 'slideshowId': id }, (e, project) => {
        if (e || !project) {
          this.fetchRemoteSlideshow(id)
            .then((slideshow) => {
              res.send({
                slideshow: slideshow,
                config: config
              });
            })
            .catch((error) => {
              res.send(error);
            });
            return;
        }
        project.slides = this.parseSlides(project.slides);
        res.send({
          slideshow: project,
          config: config
        });
      });
    });
  }

  /**
   * Strip special slides from slides data.
   * @param  {Array} slides
   * @return {Array}
   */
  parseSlides(slides) {
    return slides.filter((slide) => {
      return !/^date$|^bumper$|^bumper\_joke$|^share$/.test(slide.template.name);
    });
  }

}

module.exports = function () {
  return new slideshowController();
}
