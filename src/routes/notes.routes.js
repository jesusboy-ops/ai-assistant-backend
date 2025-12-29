const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');
const { body } = require('express-validator');
const NotesEnhancementService = require('../services/notesEnhancement.service');

// All routes require authentication
router.use(authenticate);

router.post('/', validators.createNote, notesController.createNote);
router.get('/', notesController.getNotes);
router.get('/:id', notesController.getNote);
router.put('/:id', validators.updateNote, notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

// Notes enhancement endpoints
router.post('/analyze', [
  body('content').notEmpty().withMessage('Note content is required')
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    const analysis = await NotesEnhancementService.suggestActionsFromNote(userId, content);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing note:', error);
    res.status(500).json({ error: 'Failed to analyze note' });
  }
});

router.post('/create-actions', [
  body('content').notEmpty().withMessage('Note content is required')
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    const suggestions = await NotesEnhancementService.analyzeNoteContent(userId, content);
    const results = await NotesEnhancementService.createSuggestedActions(userId, suggestions);
    
    res.json({
      message: 'Actions created from note analysis',
      results
    });
  } catch (error) {
    console.error('Error creating actions from note:', error);
    res.status(500).json({ error: 'Failed to create actions from note' });
  }
});

module.exports = router;
