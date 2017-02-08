var express = require('express');
var router = express.Router();
var request = require('request');
var generator = require('../lib/generator');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * Show slideshow by id
 */
router.get('/slideshow/:id', function(req, res, next) {
  var options = {
    url: 'http://localhost:3000/fixtures/slideshow.json'
    // url: 'http://alpha.aol.com/slideshow-json/' + req.params.id
  };
  request(options, function (error, response, body) {
    if (error) {
      console.log('Error:', error);
      res.end('');
      return false;
    }
    var data = JSON.parse(body);
    res.render('slideshow', {
      title: data.title,
      slides: data.slides,
      pageScript: 'slideshow'
    });
  });
});

/**
 * Generate video from slideshow data
 */
router.post('/generate-video', function (req, res, next) {
  generator();
  res.end('success');
});

module.exports = router;
