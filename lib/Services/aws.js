const fs = require('fs');
const path = require('path');
const sdk = require('aws-sdk');
const s3 = new sdk.S3();
const bucketName = 'alpha-global-origin';

module.exports.upload = (file) => {
  let params;
  let fileStream;
  return new Promise((resolve, reject) => {
    params = {
      Bucket: bucketName,
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