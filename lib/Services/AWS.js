const fs = require('fs');
const path = require('path');
const sdk = require('aws-sdk');
const s3 = new sdk.S3();

class AWS {

  constructor() {
      this.bucketName = 'alpha-global-origin';
  }

  /**
   * Upload video file to s3 bucket
   * example: https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/javascript/example_code/s3/s3_upload.js
   */
  upload(file) {
    let params;
    let fileStream;
    return new Promise((resolve, reject) => {
      params = {
        Bucket: this.bucketName,
        ACL: 'public-read',
        Key: 'daily-video/',
        Body: ''
      };
      fileStream = fs.createReadStream(file);
      fileStream.on('error', (e) => {
        reject(e);
      });
      params.Body = fileStream;
      params.Key = params.Key + path.basename(file);
      s3.upload (params, (e, data) => {
        if (e) {
          reject(e);
        }
        resolve(data);
      });
    });
  }
}

module.exports = AWS;
