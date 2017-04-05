const crypto = require('crypto');
const querystring = require('querystring');
const baseUrl = 'https://o.aolcdn.com/images/dims';
const clientId = process.env.DIMS_CLIENT_ID;
const clientSecret = process.env.DIMS_CLIENT_SECRET;
const signature = crypto.createHash('sha512').update(clientSecret).digest('hex');

/**
 * Create a thumbnail for the given size
 * @param {string} uri
 * @param {object} thumbnail
 * @param {int} quality
 * @return string
 */
module.exports.thumbnail = (uri, thumbnail, quality = 60) => {
  const query = querystring.stringify({
    image_uri: uri,
    thumbnail: thumbnail.join(','),
    format: 'jpg',
    quality: quality
  });
  return `${baseUrl}?${query}&client=${clientId}&signature=${crypto.createHmac('sha1', signature).update(query).digest('hex')}`;
}
