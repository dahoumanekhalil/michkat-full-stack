// src/routes/auth/auth.routes.js
/**
 * Authentication Routes
 * Handles: Register, Login, Refresh Token, Logout
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
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} = require('../../validators/authValidator');

// =============================================
// Public Authentication Routes
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
// Protected Authentication Routes
// =============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and revoke tokens
 * @access  Private
 */
router.post(
  '/logout',
  protect,
  authController.logout
);

module.exports = router;