const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { userValidationRules, validate } = require('../middleware/validation.middleware');

// Public routes
router.post('/register', userValidationRules.register, validate, authController.register);
router.post('/login', userValidationRules.login, validate, authController.login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, userValidationRules.update, validate, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;