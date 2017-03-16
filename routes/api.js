const fs = require('fs');
var express = require('express');
var router = express.Router();
var request = require('request');
var generator = require('../lib/generator');
var slidePreview = require('../lib/slide-preview');
var multer  = require('multer');
var upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      cb(null, 'audio' + req.body.timestamp + '.mp3');
    }
  })
});

function getSocketById(req, id) {
  return req.app.io.sockets.connected[id];
};

/**
 * GET: List available slideshows
 */
router.get('/slideshows', function(req, res, next) {
  var options = {
    url: 'http://alpha.aol.com/slideshows-json'
  };
  res.setHeader('Content-Type', 'application/json');
  request(options, function (error, response, body) {
    var data = JSON.parse(body);
    res.send(JSON.stringify(data));
  });
});

/**
 * GET: slideshow by id
 */
router.get('/slideshows/:id', function(req, res, next) {
  var options = {
    url: 'http://alpha.aol.com/slideshow-json/' + req.params.id
  };
  res.setHeader('Content-Type', 'application/json');
  request(options, function (error, response, body) {
    if (error) {
      console.log('Error:', error);
      res.end('{}');
      return false;
    }
    var data = JSON.parse(body);
    fs.readFile( __dirname + '/../resources/json/config.json', (e, config) => {
      if (e) {
        console.log('Missing Config');
        res.end('{}');
        return false;
      }
      res.send(JSON.stringify({
        slideshow: data,
        config: JSON.parse(config)
      }));
    });
  });
});

/**
 * POST: Generate video from slideshow data
 */
router.post('/generate-video', upload.single('narrationTrack'), function (req, res, next) {
  var slides = req.body.slides;
  var narrationTrack = __dirname + '/../public/fixtures/empty.mp3';
  var socket = getSocketById(req, req.body.socket_id);
  if (req.file) {
    narrationTrack = __dirname + '/../' + req.file.path
  }
  if (slides) {
    generator(socket, {
      narrationTrack: narrationTrack,
      slides: JSON.parse(slides),
      videoDuration: req.body.videoDuration,
      timestamp: req.body.timestamp,
      preview: req.body.preview,
      audioTrack: req.body.audioTrack,
      audioTrackLevel: req.body.audioTrackLevel
    });
    res.end('success');
  }
  res.end('fail');
});

/**
 * POST: Generate preview from slide data
 */
router.post('/generate-slide-preview', function (req, res, next) {
  var socket = getSocketById(req, req.body.socket_id);
  slidePreview(socket, req.body.slide, req.body.timestamp);
  res.end('');
});

module.exports = router;
