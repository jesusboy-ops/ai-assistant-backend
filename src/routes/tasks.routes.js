const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// CRUD operations for tasks
router.get('/', tasksController.getTasks);
router.get('/:id', validators.getTask, tasksController.getTask);
router.post('/', validators.createTask, tasksController.createTask);
router.put('/:id', validators.updateTask, tasksController.updateTask);
router.delete('/:id', validators.deleteTask, tasksController.deleteTask);

// AI integration endpoints
router.post('/from-message', validators.createTasksFromMessage, tasksController.createTasksFromMessage);
router.post('/suggestions', validators.getTaskSuggestions, tasksController.getTaskSuggestions);

module.exports = router;