// src/routes/auth/index.js
const express = require('express');
const router = express.Router();

// Import sub-routes
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const passwordResetRoutes = require('./password-reset.routes');
const adminRoutes = require('./admin.routes');

// Mount sub-routes
router.use('/', authRoutes);              // /api/auth/login, /register, etc.
router.use('/', profileRoutes);           // /api/auth/profile, /preferences, etc.
router.use('/', passwordResetRoutes);     // /api/auth/forgot-password, etc.
router.use('/users', adminRoutes);        // /api/auth/users, /users/:id, etc.

module.exports = router;