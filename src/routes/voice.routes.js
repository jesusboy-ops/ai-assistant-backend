const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voice.controller');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.post('/text-to-speech', validators.textToSpeech, voiceController.textToSpeech);
router.post('/speech-to-text', upload.single('audio'), voiceController.speechToText);
router.get('/voices', voiceController.getVoices);

module.exports = router;
