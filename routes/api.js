const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const amp = require('../lib/Services/amp');
const jobQueue = require('../lib/jobQueue');
const projectController = require('../lib/Controllers/projectController')(jobQueue);
const previewController = require('../lib/Controllers/previewController')(jobQueue);
const vidibleController = require('../lib/Controllers/vidibleController')();
const slideshowController = require('../lib/Controllers/slideshowController')();
const appRoot = path.resolve(__dirname, '../');
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      if (file.mimetype === 'audio/mp3') {
        cb(null, 'audio' + Date.now() + '.mp3');
      } else {
        cb(null, file.originalname);
      }
    }
  })
});

/**
 * GET: List available slideshows
 */
router.get('/slideshows/page/:page', (req, res) => {
  slideshowController.all(req, res);
});

/**
 * POST: Create a new slideshow
 */
router.post('/slideshows/create', [amp.authenticate], (req, res) => {
  slideshowController.create(req, res);
});

/**
 * POST: Save a slideshow
 */
router.post('/slideshows/save', [amp.authenticate], (req, res) => {
  slideshowController.save(req, res);
});

/**
 * POST: Save a slideshow
 */
router.post('/slideshows/dims-image', (req, res) => {
  res.send(slideshowController.getImagesFromDims(req.body.image, req.body.type));
});

/**
 * POST: Create a new slide
 */
router.post('/slideshows/slide/add', [amp.authenticate], (req, res) => {
  slideshowController.addSlide(req, res);
});

/**
 * POST: Save a slide
 */
router.post('/slideshows/slide/save', [amp.authenticate], (req, res) => {
  slideshowController.saveSlide(req, res);
});

/**
 * POST: Delete a slide
 */
router.post('/slideshows/slide/delete', [amp.authenticate], (req, res) => {
  slideshowController.deleteSlide(req, res);
});

/**
 * POST: Move a slide
 */
router.post('/slideshows/slide/move', [amp.authenticate], (req, res) => {
  slideshowController.moveSlide(req, res);
});

/**
 * POST: Upload image and generate crop url
 */
router.post('/slideshows/image/upload', upload.single('file'), (req, res) => {
  slideshowController.imageUpload(req, res);
});

/**
 * POST: Upload video
 */
router.post('/slideshows/video/upload', upload.single('file'), (req, res) => {
  slideshowController.videoUpload(req, res);
});

/**
 * POST: Upload audio
 */
router.post('/slideshows/audio/upload', upload.single('file'), (req, res) => {
  slideshowController.audioUpload(req, res);
});

/**
 * GET: slideshow by id
 */
router.get('/slideshows/:id', (req, res) => {
  slideshowController.one(req, res);
});

/**
 * POST: Generate preview from slide data
 */
router.post('/preview-slide', (req, res) => {
  previewController.render(req, res);
});

/**
 * POST: Render project to video
 */
router.post('/render-project', upload.single('narrationTrack'), (req, res) => {
  projectController.render(req, res);
});

/**
 * POST: Save project data
 */
router.post('/save-project', upload.single('narrationTrack'), (req, res) => {
  projectController.save(req, res);
});

/**
 * POST: Upload video to Vidible
 */
router.post('/vidible-upload', (req, res) => {
  vidibleController.upload(req, res);
});

/**
 * GET: List company videos from Vidible
 */
router.get('/vidible-uploads', (req, res) => {
  vidibleController.search(req, res);
});

/**
 * Catchall
 */
router.get('/*', (req, res) => {
  res.send({
    error: 'service not found'
  });
});

module.exports = router;
