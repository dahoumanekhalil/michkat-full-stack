// src/routes/auth/admin.routes.js
/**
 * Admin User Management Routes
 * Handles: List Users, Get User, Update User Status, Delete User
 * Note: All routes are prefixed with /api/auth/users
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect, isAdmin, isSuperAdmin } = require('../../middleware/authMiddleware');

// =============================================
// Admin User Management Routes
// All routes require admin authentication
// =============================================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (with pagination, filtering, sorting)
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  isAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Admin users list endpoint',
      data: {
        users: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
        },
      },
    });
  }
);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Get user details by ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  protect,
  isAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Admin get user endpoint',
      data: {
        user: null,
      },
    });
  }
);

/**
 * @route   PUT /api/auth/users/:id/status
 * @desc    Update user account status (ACTIVE, INACTIVE, SUSPENDED, BANNED)
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  protect,
  isAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Admin update user status endpoint',
      data: {
        user: null,
      },
    });
  }
);

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Update user information (by admin)
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  isAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Admin update user endpoint',
      data: {
        user: null,
      },
    });
  }
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (hard or soft delete)
 * @access  Private/Super Admin Only
 */
router.delete(
  '/:id',
  protect,
  isSuperAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Super admin delete user endpoint',
    });
  }
);

/**
 * @route   POST /api/auth/users/:id/ban
 * @desc    Ban user (BANNED status + reason)
 * @access  Private/Admin
 */
router.post(
  '/:id/ban',
  protect,
  isAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Admin ban user endpoint',
    });
  }
);

/**
 * @route   POST /api/auth/users/:id/unban
 * @desc    Unban user (restore to ACTIVE)
 * @access  Private/Admin
 */
router.post(
  '/:id/unban',
  protect,
  isAdmin,
  async (req, res) => {
    // TODO: Implement in userController
    res.json({
      success: true,
      message: 'Admin unban user endpoint',
    });
  }
);

module.exports = router;