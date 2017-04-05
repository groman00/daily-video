const path = require('path');
const request = require('request');
const appRoot = path.resolve(__dirname, '../../');
const aws = require('../Services/aws');

class VidibleController {

  /**
   */
  constructor() {
    this.companyId = process.env.VIDIBLE_COMPANY_ID;
    this.companyKey = process.env.VIDIBLE_COMPANY_KEY;
    this.url = ['http://api.vidible.tv/', this.companyKey, '/video'].join('');
  }

  /**
   * Upload to Vidible
   * https://help.aolonnetwork.com/hc/en-us/articles/209634233-POST-Create-Video-Upload-
   * https://help.aolonnetwork.com/hc/en-us/articles/210177233
   */
  upload(req, res, next) {
    const options = {
      url: this.url,
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST',
      json: {
       'name': req.body.name,
       'encodingProfileId': '54f3028ce4b0eb68ceca1c1f',
       'storageType': 'ENCODED'
      }
    };
    aws.upload(appRoot + '/public/exports/' + req.body.file)
      .then((s3Data) => {
        options.json.originalVideoUrl = s3Data.Location;
        request(options, (e, httpResponse, body) => {
          res.send(body);
        });
      })
      .catch((e) => {
        console.log(e);
        res.send('error');
      });
  }

  /**
   */
  search(req, res, next) {
    const options = {
      url: this.url + '/search?query=companyId:' + this.companyId,
      headers: {
        'Content-type': 'application/json'
      }
    };
    request(options, (e, httpResponse, body) => {
      res.send(JSON.parse(body));
    });

  }

}

module.exports = function () {
  return new VidibleController();
}
