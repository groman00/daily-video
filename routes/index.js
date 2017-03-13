const fs = require('fs');
var express = require('express');
var router = express.Router();
var request = require('request');
var generator = require('../lib/generator');
var multer  = require('multer');
var upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      cb(null, 'audio' + req.body.timestamp + '.mp3');
    }
  })
});

/**
 * GET: List available slideshows
 */
router.get('/', function(req, res, next) {
  var options = {
    //url: 'http://localhost:3000/fixtures/slideshows.json'
    url: 'http://alpha.aol.com/slideshows-json'
  };
  request(options, function (error, response, body) {
    var data = JSON.parse(body);
    res.render('index', {
      title: 'Select a Slideshow',
      slideshows: data.results
    });
  });
});

/**
 * GET: slideshow by id
 */
router.get('/slideshow/:id', function(req, res, next) {
  var options = {
    //url: 'http://localhost:3000/fixtures/slideshow.json'
    url: 'http://alpha.aol.com/slideshow-json/' + req.params.id
  };
  request(options, function (error, response, body) {
    if (error) {
      console.log('Error:', error);
      res.end('');
      return false;
    }
    var data = JSON.parse(body);
    fs.readFile( __dirname + '/../resources/json/config.json', (e, videoConfig) => {
      if (e) {
        console.log('Missing Config');
        res.end('');
        return false;
      }
      res.render('slideshow', {
        title: data.title,
        slides: data.slides,
        config: JSON.parse(videoConfig),
        pageScript: 'slideshow'
      });
    });
  });
});

/**
 * POST: Generate video from slideshow data
 */
router.post('/generate-video', upload.single('audio'), function (req, res, next) {
  var slides = req.body.slides;
  var audio = __dirname + '/../public/fixtures/empty.mp3';
  var socket = req.app.io.sockets.connected[req.body.socket_id];
  if (req.file) {
    audio = __dirname + '/../' + req.file.path
  }
  if (slides) {
    generator(socket, {
      audio: audio,
      slides: JSON.parse(slides),
      videoDuration: req.body.videoDuration,
      //slideDuration: req.body.slideDuration,
      timestamp: req.body.timestamp
    });
    res.end('success');
  }
  res.end('fail');
});

module.exports = router;
