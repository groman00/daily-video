const express = require('express');
const manifest = require('../public/js/manifest.json');
const router = express.Router();

console.log(manifest);
router.get('/', function(req, res, next) {
    res.render('index', {
        script: manifest['main.js'],
        stylesheet: manifest['main.css']
    });
});

module.exports = router;
