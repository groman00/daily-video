const fs = require('fs');
const express = require('express');
const router = express.Router();
const request = require('request');
const multer  = require('multer');
const jobQueue = require('../lib/jobQueue');
const projectController = require('../lib/Controllers/projectController')(jobQueue);
const previewController = require('../lib/Controllers/previewController')(jobQueue);
const vidibleController = require('../lib/Controllers/vidibleController')();
const slideshowController = require('../lib/Controllers/slideshowController')();
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
router.get('/slideshows', (req, res, next) => {
  slideshowController.all(req, res, next);
});

/**
 * GET: slideshow by id
 */
router.get('/slideshows/:id', (req, res, next) => {
  slideshowController.one(req, res, next);
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
 * POST: Upload video to Vidible
 */
//router.post('/upload-video', (req, res, next) => {
router.post('/vidible-upload', (req, res, next) => {
  vidibleController.upload(req, res, next);
});

/**
 * GET: List company videos from Vidible
 */
router.get('/vidible-uploads', (req, res, next) => {
  vidibleController.search(req, res, next);
});

/**
 * Catchall
 */
router.get('/*', (req, res, next) => {
  res.send({
    error: 'service not found'
  });
});

module.exports = router;
