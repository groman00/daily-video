const fs = require('fs');
const express = require('express');
const router = express.Router();
const request = require('request');
const generator = require('../lib/generator');
const slidePreview = require('../lib/slide-preview');
const multer  = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      cb(null, 'audio' + Date.now() + '.mp3');
    }
  })
});

const jobQueue = require('../lib/jobQueue');
const projectController = require('../lib/Controllers/projectController')(jobQueue);

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
    /* todo: put template config into mongo */
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
      audioTrackLevel: req.body.audioTrackLevel,
      narrationTrackLevel: req.body.narrationTrackLevel
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


/**
 * POST: Render project to video
 */
router.post('/render-project', upload.single('narrationTrack'), (req, res, next) => {
  projectController.render(req, res, next);
});

/**
 * POST: Save project data
 */
router.post('/save-project', upload.single('narrationTrack'), (req, res, next) => {
  projectController.save(req, res, next);
});

module.exports = router;
