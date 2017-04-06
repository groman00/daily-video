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
 * @property {Function} callback
 * @property {int} attempts
 */
function sendRequest(data, callback, attempts = 0) {
  const options = Object.assign({
    url: api + data.endpoint,
    headers: { 'Authorization': 'Bearer ' + accessToken }
  }, data.options);
  let bodyObject;
  request(options, (e, response, body) => {
    if (response.statusCode === 400) {
      callback.apply(this, [{ error: 'bad request' }]);
      return;
    }
    if (response.statusCode === 401) {
      // If we're making multiple attempts, something is most likely broken.  Stop after two.
      if (attempts > 1) {
        callback.apply(this, [{ error: 'unauthorized' }]);
        return;
      }
      getToken()
        .then((token) => {
          sendRequest(data, callback, attempts + 1);
        });
      return;
    }
    bodyObject = typeof body === 'string' ? JSON.parse(body) : body;
    callback.apply(this, [null, bodyObject]);
  });
}

/**
 * Prepare request for send and return a Promise
 */
function deferredRequest(data) {
  return new Promise((resolve, reject) => {
    sendRequest(data,
      (error, response) => {
        if(error) {
          reject(error);
          return;
        }
        resolve(response);
      });
  });
}

/**
 * Middleware to set access token if undefined
 */
module.exports.authenticate = (req, res, next) => {
  // todo: set this up to refresh using expire time
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
  get(id) {
    return deferredRequest({
      endpoint: '/slideshows/' + id,
      options: {}
    });
  },
  query(site_ids) {
    return deferredRequest({
      endpoint: '/slideshows/?site_ids%5B%5D=' + site_ids.join(','),
      options: {}
    });
  },
  create(site_id) {
    return deferredRequest({
      endpoint: '/slideshows/',
      options: {
        method: 'POST',
        json: {
          user_id: 4754169, // Using groman00's id.  Maybe we should make a new contributor for this.
          site_id: site_id,
          title: 'Untitled',
          slug: 'video-generator-' + Date.now()
        }
      }
    });
  }
};
