const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// Public route for VAPID key
router.get('/vapid-public-key', notificationController.getVapidPublicKey);

// Protected routes
router.use(authenticate);

router.post('/subscribe', validators.subscribe, notificationController.subscribe);
router.post('/unsubscribe', notificationController.unsubscribe);
router.post('/test', notificationController.sendTestNotification);

module.exports = router;
