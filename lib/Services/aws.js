const fs = require('fs');
const path = require('path');
const sdk = require('aws-sdk');
const s3 = new sdk.S3();
const bucketName = 'alpha-global-origin';

module.exports.upload = (file, folder) => {
    let params;
    let fileStream;
    return new Promise((resolve, reject) => {
        params = {
            Bucket: bucketName,
            ACL: 'public-read',
            Key: 'daily-video/' + folder + '/',
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

module.exports.copy = (fileName, sourceFolder, destFolder) => {
    let params;
    return new Promise((resolve, reject) => {
        params = {
            Bucket: bucketName,
            CopySource: `${bucketName}/daily-video/${sourceFolder}/${fileName}`,
            Key: `daily-video/${destFolder}/${fileName}`
        };
        s3.copyObject (params, (e, data) => {
            if (e) {
                reject(e);
            }
            data.Location = params.Key;
            resolve(data);
        });
    });
}