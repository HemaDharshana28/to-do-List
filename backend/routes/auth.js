const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// PUT /api/auth/profile
router.put('/profile', authenticate, [
  body('name').trim().notEmpty().withMessage('Name is required'),
], updateProfile);

// PUT /api/auth/password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], changePassword);

module.exports = router;
