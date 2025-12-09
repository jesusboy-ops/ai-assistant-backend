const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware wrapper
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

/**
 * Common validation rules
 */
const validators = {
  // Auth validators
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    validate
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],

  resetPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate
  ],

  updatePassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
  ],

  // User validators
  updateProfile: [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate
  ],

  // Chat validators
  sendMessage: [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('conversationId').optional().isString(),
    validate
  ],

  // Email validators
  generateEmail: [
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('tone').optional().isIn(['professional', 'casual', 'formal', 'friendly']),
    validate
  ],

  sendEmail: [
    body('to').isEmail().normalizeEmail().withMessage('Valid recipient email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Email body is required'),
    validate
  ],

  // Calendar validators
  createEvent: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('start_time').isISO8601().withMessage('Valid start time is required'),
    body('end_time').isISO8601().withMessage('Valid end time is required'),
    body('description').optional().trim(),
    validate
  ],

  updateEvent: [
    param('id').isUUID().withMessage('Valid event ID is required'),
    body('title').optional().trim().notEmpty(),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601(),
    validate
  ],

  // Notes validators
  createNote: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('tags').optional().isArray(),
    validate
  ],

  updateNote: [
    param('id').isUUID().withMessage('Valid note ID is required'),
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('tags').optional().isArray(),
    validate
  ],

  // Notification validators
  subscribe: [
    body('subscription').isObject().withMessage('Valid subscription object is required'),
    body('subscription.endpoint').notEmpty().withMessage('Endpoint is required'),
    body('subscription.keys').isObject().withMessage('Keys object is required'),
    validate
  ],

  // Voice validators
  textToSpeech: [
    body('text').trim().notEmpty().withMessage('Text is required'),
    body('voice').optional().isIn(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']),
    validate
  ]
};

module.exports = validators;
