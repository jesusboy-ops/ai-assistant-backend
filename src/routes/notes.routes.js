const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { authenticate } = require('../middlewares/auth');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.post('/', validators.createNote, notesController.createNote);
router.get('/', notesController.getNotes);
router.get('/:id', notesController.getNote);
router.put('/:id', validators.updateNote, notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;
