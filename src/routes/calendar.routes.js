const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.post('/events', validators.createEvent, calendarController.createEvent);
router.get('/events', calendarController.getEvents);
router.get('/events/:id', calendarController.getEvent);
router.put('/events/:id', validators.updateEvent, calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

module.exports = router;
