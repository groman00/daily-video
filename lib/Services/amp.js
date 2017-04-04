const request = require('request');
const api = 'https://publishing.api.aol.com';
const tokenUrl = api + '/oauth/token?grant_type=client_credentials&scope=amp';
const authSignature = Buffer.from(process.env.AMP_CLIENT_ID + ':' + process.env.AMP_CLIENT_SECRET , 'utf8').toString('base64');
let accessToken = null;

function setToken(token) {
  accessToken = token;
}

/**
 */
function getToken() {
  const options = {
    url: tokenUrl,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + authSignature
    }
  };
  return new Promise((resolve, reject) => {
    request(options, (e, response, body) => {
      if (e) {
        reject(e);
        return;
      }
      console.log('requesting new access_token');
      setToken(JSON.parse(body).access_token);
      resolve();
    });
  });
}

/**
 * Send a request to AMP api
 * @property {Object} data
 * @property {string} data.endpoint
 * @property {Object} data.options
 */
function sendRequest(data, callback, attempts = 0) {
  const options = Object.assign({
    url: api + data.endpoint,
    headers: { 'Authorization': 'Bearer ' + accessToken }
  }, data.options);
  let response;
  request(options, (e, response, body) => {
    if (e) {
      callback.apply(this, [null]);
      return;
    }
    if (response.statusCode === 401) {
      if (attempts > 1) {
        callback.apply(this, [null]);
        return;
      }
      getToken()
        .then((token) => {
          sendRequest(data, callback, attempts + 1);
        });
      return;
    }
    callback.apply(this, [JSON.parse(body)]);
  });
}

/**
 * Prepare request for send and return a Promise
 */
function deferredRequest(data) {
  return new Promise((resolve, reject) => {
    sendRequest(data,
      (response) => {
        if(!response) {
          reject();
          return;
        }
        resolve(response);
      });
  });
}

/**
 * Set access token if undefined
 */
module.exports.authenticate = function (req, res, next) {
  if (accessToken) {
    next();
    return;
  }
  getToken()
    .then((token) => {
      next();
    })
    .catch(() => {
      res.end();
    });
}

module.exports.slideshows = {

  get: function () {
    return deferredRequest({
      endpoint: '/slideshows/?site_ids%5B%5D=996',
      options: {}
    });
  }

};
