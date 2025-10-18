// src/routes/auth/password-reset.routes.js
/**
 * Password Reset Routes
 * Handles: Forgot Password, Verify Token, Reset Password
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Controllers
const authController = require('../../controllers/authController');

// Middleware
const { rateLimit } = require('../../middleware/authMiddleware');

// Validators
const { validate } = require('../../validators/authValidator');

// =============================================
// Password Reset Routes (All Public)
// =============================================

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset token via email
 * @access  Public
 */
router.post(
  '/forgot-password',
  rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 3 }), // 3 requests per 15 minutes
  [
    body('email')
      .isEmail()
      .withMessage('البريد الإلكتروني غير صالح')
      .normalizeEmail()
  ],
  validate,
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/verify-reset-token
 * @desc    Verify password reset token validity
 * @access  Public
 */
router.post(
  '/verify-reset-token',
  [
    body('token')
      .notEmpty()
      .withMessage('الرمز مطلوب')
  ],
  validate,
  authController.verifyResetToken
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with valid token
 * @access  Public
 */
router.post(
  '/reset-password',
  rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 5 }), // 5 requests per hour
  [
    body('token')
      .notEmpty()
      .withMessage('الرمز مطلوب'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  ],
  validate,
  authController.resetPassword
);

module.exports = router;