const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.post('/generate', validators.generateEmail, emailController.generateEmail);
router.post('/send', validators.sendEmail, emailController.sendEmail);
router.post('/generate-and-send', emailController.generateAndSend);

module.exports = router;
