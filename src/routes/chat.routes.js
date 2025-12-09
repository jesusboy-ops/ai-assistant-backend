const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.post('/message', validators.sendMessage, chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

module.exports = router;
