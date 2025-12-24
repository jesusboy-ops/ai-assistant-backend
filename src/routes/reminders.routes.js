const express = require('express');
const router = express.Router();
const remindersController = require('../controllers/reminders.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// CRUD operations for reminders
router.get('/', remindersController.getReminders);
router.get('/upcoming', remindersController.getUpcomingReminders);
router.get('/:id', validators.getReminder, remindersController.getReminder);
router.post('/', validators.createReminder, remindersController.createReminder);
router.put('/:id', validators.updateReminder, remindersController.updateReminder);
router.delete('/:id', validators.deleteReminder, remindersController.deleteReminder);

// AI integration endpoints
router.post('/from-message', validators.createRemindersFromMessage, remindersController.createRemindersFromMessage);

module.exports = router;