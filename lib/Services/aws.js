const fs = require('fs');
const path = require('path');
const sdk = require('aws-sdk');
const s3 = new sdk.S3();
const s3Client = require('s3');
const client = s3Client.createClient({
    s3Client: s3
});
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

module.exports.uploadDir = (dir, folder) => {
    let params;
    return new Promise((resolve, reject) => {
        params = {
            localDir: dir,
            s3Params: {
                Bucket: bucketName,
                ACL: 'public-read',
                Prefix: 'daily-video/' + folder + '/'
            }
        };

        var uploader = client.uploadDir(params);
        uploader.on('error', (e) => {
            reject(e);
        });

        uploader.on('end', () => {
            resolve();
        });
    });
}
