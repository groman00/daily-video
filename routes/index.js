var express = require('express');
var router = express.Router();
var request = require('request');
var generator = require('../lib/generator');
var multer  = require('multer');
var upload = multer({
  storage: multer.diskStorage({
    destination: './temp/audio/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '_' + Date.now() + '.mp3');
    }
  })
});

/**
 * GET: home page
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * GET: slideshow by id
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
 * POST: Generate video from slideshow data
 */
router.post('/generate-video', upload.single('audio'), function (req, res, next) {
  var slides = req.body.slides;
  var audio = __dirname + '/../public/fixtures/empty.mp3';
  if (req.file) {
    audio = __dirname + '/../' + req.file.path
  }
  if (slides) {
    generator({
      audio: audio,
      slides: JSON.parse(slides),
      videoDuration: req.body.videoDuration,
      slideDuration: req.body.slideDuration,
      timestamp: req.body.timestamp
    });
    res.end('success');
  }
  res.end('fail');
});

module.exports = router;
