// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');

// Middleware
const { protect, authorize, isAdmin, isSuperAdmin, rateLimit } = require('../middleware/authMiddleware');

// Validators
const {
  validate,
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  updateProfileValidation,
  updatePreferencesValidation,
  changePasswordValidation
} = require('../validators/authValidator');

// =============================================
// Public Routes
// =============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 5 }), // 5 requests per hour
  registerValidation,
  validate,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 }), // 10 requests per 15 minutes
  loginValidation,
  validate,
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

// =============================================
// Protected Routes (Require Authentication)
// =============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  protect,
  authController.logout
);

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
 * @desc    Update user profile
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
 * @desc    Update user preferences
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

// =============================================
// Admin Routes
// =============================================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/users',
  protect,
  isAdmin,
  async (req, res) => {
    // This will be implemented in admin controller
    res.json({ success: true, message: 'Admin users list endpoint' });
  }
);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/users/:id',
  protect,
  isAdmin,
  async (req, res) => {
    // This will be implemented in admin controller
    res.json({ success: true, message: 'Admin get user endpoint' });
  }
);

/**
 * @route   PUT /api/auth/users/:id/status
 * @desc    Update user status (Admin only)
 * @access  Private/Admin
 */
router.put(
  '/users/:id/status',
  protect,
  isAdmin,
  async (req, res) => {
    // This will be implemented in admin controller
    res.json({ success: true, message: 'Admin update user status endpoint' });
  }
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (Super Admin only)
 * @access  Private/Super Admin
 */
router.delete(
  '/users/:id',
  protect,
  isSuperAdmin,
  async (req, res) => {
    // This will be implemented in admin controller
    res.json({ success: true, message: 'Super admin delete user endpoint' });
  }
);

module.exports = router;