var express = require('express');
var router = express.Router();
var request = require('request');

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
    res.send(JSON.stringify(data));
    // fs.readFile( __dirname + '/../resources/json/config.json', (e, videoConfig) => {
    //   if (e) {
    //     console.log('Missing Config');
    //     res.end('');
    //     return false;
    //   }
    //   res.render('slideshow', {
    //     title: data.title,
    //     slides: data.slides,
    //     config: JSON.parse(videoConfig),
    //     pageScript: 'slideshow'
    //   });
    // });
  });
});

module.exports = router;