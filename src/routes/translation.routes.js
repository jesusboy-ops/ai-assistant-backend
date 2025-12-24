const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translation.controller');
const { authenticate } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
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

// Translation validation rules
const translateValidation = [
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('source').optional().isString().withMessage('Source language must be a string'),
  body('target').optional().isString().withMessage('Target language must be a string'),
  validate
];

const detectValidation = [
  body('text').trim().notEmpty().withMessage('Text is required'),
  validate
];

// All routes require authentication
router.use(authenticate);

// Translation endpoints
router.post('/translate', translateValidation, translationController.translateText);
router.get('/languages', translationController.getSupportedLanguages);
router.post('/detect', detectValidation, translationController.detectLanguage);

module.exports = router;