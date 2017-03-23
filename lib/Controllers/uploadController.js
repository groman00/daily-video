const path = require('path');
const request = require('request');
const appRoot = path.resolve(__dirname, '../../');

/**
 *
 * https://help.aolonnetwork.com/hc/en-us/articles/209634233-POST-Create-Video-Upload-
 * https://help.aolonnetwork.com/hc/en-us/articles/210177233
 *
 */

class UploadController {

  /**
   */
  constructor() {
    this.url = ['http://api.vidible.tv/', process.env.VIDIBLE_COMPANY_KEY, '/video'].join('');
  }

  /**
   */
  upload(req, res, next) {

    var options = {
      url: this.url,
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST',
      json: {
       'name': 'Ingest Alpha Daily Video',
       'encodingProfileId': '54f3028ce4b0eb68ceca1c1f',
       'storageType': 'ENCODED',
       'originalVideoUrl': 'https://www.dropbox.com/s/clwgec0r3lf14uz/DailyVideo_58d3d3d2d24ade7825135ad0.mov?dl=1'
       // 'originalVideoUrl': 'http://cdn.vidible.tv/stage/2016-04/06/5705274ee4b0e57305dd5599_v1.orig.mp4'
      }
    };

    request(options, (e, httpResponse, body) => {
      console.log(e);
      res.send(body);
    });

  }

}

module.exports = function () {
  return new UploadController();
}
