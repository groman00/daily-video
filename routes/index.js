const express = require('express');
const manifest = require('../public/manifest.json');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', {
        script: manifest['main.js'],
        stylesheet: manifest['main.css']
    });
});

module.exports = router;
