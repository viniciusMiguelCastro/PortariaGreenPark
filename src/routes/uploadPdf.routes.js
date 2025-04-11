const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadPdf');

router.post('/upload-pdf', uploadController);

module.exports = router;
