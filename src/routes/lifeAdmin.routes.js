const express = require('express');
const { body } = require('express-validator');
const LifeAdminController = require('../controllers/lifeAdmin.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for life obligations
const obligationValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('category').optional().isIn(['education', 'finance', 'work', 'personal', 'health', 'other']),
  body('type').optional().isIn(['one_time', 'recurring']),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
  body('due_date').isISO8601().withMessage('Valid due date is required'),
  body('consequence').optional().isString(),
  body('risk_level').optional().isIn(['low', 'medium', 'high'])
];

// Apply authentication to all routes
router.use(authenticate);

// Life Obligations CRUD
router.get('/obligations', LifeAdminController.getObligations);
router.get('/obligations/:id', LifeAdminController.getObligationById);
router.post('/obligations', obligationValidation, LifeAdminController.createObligation);
router.put('/obligations/:id', obligationValidation, LifeAdminController.updateObligation);
router.delete('/obligations/:id', LifeAdminController.deleteObligation);

// Obligation actions
router.post('/obligations/:id/complete', LifeAdminController.completeObligation);

// AI Logic endpoints (structured outputs only)
router.post('/generate-plan', [
  body('input').notEmpty().withMessage('Input is required'),
  body('context').optional().isObject()
], LifeAdminController.generatePlan);

// Monitoring and automation
router.post('/check-deadlines', LifeAdminController.checkDeadlines);
router.post('/renew-recurring', LifeAdminController.renewRecurring);

// Statistics
router.get('/stats', LifeAdminController.getStats);

module.exports = router;