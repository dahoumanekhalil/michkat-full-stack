// src/routes/auth/profile.routes.js
/**
 * Profile Management Routes
 * Handles: Get Profile, Update Profile, Update Preferences, Change Password
 */

const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../../controllers/authController');

// Middleware
const { protect, rateLimit } = require('../../middleware/authMiddleware');

// Validators
const {
  validate,
  updateProfileValidation,
  updatePreferencesValidation,
  changePasswordValidation,
} = require('../../validators/authValidator');

// =============================================
// Profile Routes (All Protected)
// =============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  protect,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  updateProfileValidation,
  validate,
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user preferences (language, theme, notifications)
 * @access  Private
 */
router.put(
  '/preferences',
  protect,
  updatePreferencesValidation,
  validate,
  authController.updatePreferences
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  protect,
  rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3 }), // 3 requests per hour
  changePasswordValidation,
  validate,
  authController.changePassword
);

module.exports = router;