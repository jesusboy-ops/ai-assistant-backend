const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validators = require('../utils/validators');
const { authenticate } = require('../middlewares/auth');

// Public routes
router.post('/register', validators.register, authController.register);
router.post('/login', validators.login, authController.login);
router.post('/oauth/google', authController.googleAuth);
router.get('/oauth/google/url', authController.getGoogleAuthUrl);
router.get('/oauth/google/callback', authController.googleOAuthCallback);
router.post('/password-reset/request', validators.resetPassword, authController.requestPasswordReset);
router.post('/password-reset/confirm', validators.updatePassword, authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
