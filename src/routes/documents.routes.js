const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documents.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Document summarization endpoints
router.post('/summarize', uploadSingle, documentsController.summarizeDocument);
router.get('/summaries', documentsController.getDocumentSummaries);
router.get('/summaries/:id', validators.getDocumentSummary, documentsController.getDocumentSummary);
router.delete('/summaries/:id', validators.deleteDocumentSummary, documentsController.deleteDocumentSummary);
router.post('/key-points', validators.extractKeyPoints, documentsController.extractKeyPoints);

module.exports = router;