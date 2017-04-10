const crypto = require('crypto');
const querystring = require('querystring');
const baseUrl = 'https://o.aolcdn.com/images/dims';
const clientId = process.env.DIMS_CLIENT_ID;
const clientSecret = process.env.DIMS_CLIENT_SECRET;
const signature = crypto.createHash('sha512').update(clientSecret).digest('hex');

function signedImageUrl(query) {
  return `${baseUrl}?${query}&client=${clientId}&signature=${crypto.createHmac('sha1', signature).update(query).digest('hex')}`;
}

/**
 * Create a thumbnail for the given size
 * @param {string} uri
 * @param {object} thumbnail
 * @param {int} quality
 * @return string
 */
module.exports.thumbnail = (uri, thumbnail, quality = 70) => {
  return signedImageUrl(querystring.stringify({
    image_uri: uri,
    thumbnail: thumbnail.join(','),
    format: 'original',
    quality: quality
  }));
}

/**
 * Crop an image
 * @param {string} uri
 * @param {object} thumbnail
 * @param {int} quality
 * @return string
 */
module.exports.crop = (uri, crop, quality = 70) => {
  return signedImageUrl(querystring.stringify({
    image_uri: uri,
    crop: crop.join(','),
    format: 'original',
    quality: quality
  }));
}

/**
 * Take any combination of operations and make request to dims
 * todo: remove crop and thumbnail functions
 */
module.exports.request = (uri, operations, quality = 70) => {
  const requestObject = {
    image_uri: uri,
    format: 'original',
    quality: quality
  };
  Object.keys(operations).forEach((key) => {
    requestObject[key] = operations[key].join(',');
  });
  return signedImageUrl(querystring.stringify(requestObject));
}
