const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validators = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validators.updateProfile, userController.updateProfile);
router.post('/profile/picture', upload.single('image'), userController.uploadProfilePicture);
router.post('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

module.exports = router;
