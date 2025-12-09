const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/files', uploadController.getFiles);
router.delete('/files/:id', uploadController.deleteFile);

module.exports = router;
