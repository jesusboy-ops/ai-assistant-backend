const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');
const { body } = require('express-validator');
const TasksService = require('../services/tasks.service');

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

// Task enhancement endpoints
router.post('/split/:id', [
  body('subtasks').isArray().withMessage('Subtasks must be an array'),
  body('subtasks.*.title').notEmpty().withMessage('Each subtask must have a title')
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { subtasks } = req.body;

    const { data, error } = await TasksService.splitLargeTask(userId, id, subtasks);

    if (error) {
      return res.status(400).json({ error });
    }

    res.json({
      message: 'Task split into subtasks successfully',
      subtasks: data
    });
  } catch (error) {
    console.error('Error splitting task:', error);
    res.status(500).json({ error: 'Failed to split task' });
  }
});

router.post('/check-overload', [
  body('date').optional().isISO8601().withMessage('Date must be valid ISO 8601 format')
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;

    const { data, error } = await TasksService.checkTaskOverload(userId, date);

    if (error) {
      return res.status(400).json({ error });
    }

    res.json(data);
  } catch (error) {
    console.error('Error checking task overload:', error);
    res.status(500).json({ error: 'Failed to check task overload' });
  }
});

router.post('/suggest-reschedule', [
  body('date').isISO8601().withMessage('Date is required and must be valid ISO 8601 format')
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;

    const { data, error } = await TasksService.suggestRescheduling(userId, date);

    if (error) {
      return res.status(400).json({ error });
    }

    res.json(data);
  } catch (error) {
    console.error('Error suggesting reschedule:', error);
    res.status(500).json({ error: 'Failed to suggest rescheduling' });
  }
});

router.post('/auto-reschedule', [
  body('taskIds').isArray().withMessage('Task IDs must be an array'),
  body('newDate').isISO8601().withMessage('New date is required and must be valid ISO 8601 format')
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskIds, newDate } = req.body;

    const { data, error } = await TasksService.autoReschedule(userId, taskIds, newDate);

    if (error) {
      return res.status(400).json({ error });
    }

    res.json({
      message: 'Tasks rescheduled successfully',
      updated_tasks: data
    });
  } catch (error) {
    console.error('Error auto-rescheduling tasks:', error);
    res.status(500).json({ error: 'Failed to reschedule tasks' });
  }
});

module.exports = router;