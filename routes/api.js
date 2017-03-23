const fs = require('fs');
const express = require('express');
const router = express.Router();
const request = require('request');
const multer  = require('multer');
const jobQueue = require('../lib/jobQueue');
const projectController = require('../lib/Controllers/projectController')(jobQueue);
const previewController = require('../lib/Controllers/previewController')(jobQueue);
const uploadController = require('../lib/Controllers/uploadController')();
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      cb(null, 'audio' + Date.now() + '.mp3');
    }
  })
});

/**
 * GET: List available slideshows
 */
router.get('/slideshows', function(req, res, next) {
  var options = {
    url: 'http://alpha.aol.com/slideshows-json?site_id=996'
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
    /* todo: put template config into mongo? */
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
 * POST: Generate preview from slide data
 */
router.post('/preview-slide', (req, res, next) => {
  previewController.render(req, res, next);
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

/**
 * POST: Upload video to vidible
 */
//router.post('/upload-video', (req, res, next) => {
router.get('/upload-video', (req, res, next) => {
  uploadController.upload(req, res, next);
});

module.exports = router;
