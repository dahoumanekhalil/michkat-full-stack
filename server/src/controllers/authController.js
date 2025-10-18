// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// =============================================
// Helper Functions
// =============================================

// Generate Access Token
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Calculate token expiration date
const getTokenExpiration = (expiresIn) => {
  const match = expiresIn.match(/(\d+)([dhms])/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + value * multipliers[unit]);
};

// Extract device info from user agent
const extractDeviceInfo = (userAgent) => {
  if (!userAgent) return {};
  
  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, operatingSystem: os };
};

// =============================================
// Register New User
// =============================================
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, language = 'AR' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile and preferences
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        profile: {
          create: {
            firstName,
            lastName,
            phone
          }
        },
        preferences: {
          create: {
            language: language.toUpperCase(),
            theme: 'LIGHT',
            emailNotifications: true,
            newsletterSubscribed: true
          }
        }
      },
      include: {
        profile: true,
        preferences: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Save refresh token
    const deviceInfo = extractDeviceInfo(req.headers['user-agent']);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getTokenExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        ...deviceInfo
      }
    });

    // Log successful registration
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        ...deviceInfo,
        loginAt: new Date()
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التسجيل',
      error: error.message
    });
  }
};

// =============================================
// Login User
// =============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceInfo = extractDeviceInfo(req.headers['user-agent']);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        preferences: true
      }
    });

    // Check if user exists
    if (!user) {
      // Log failed attempt
      await prisma.loginHistory.create({
        data: {
          userId: null,
          success: false,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          failureReason: 'البريد الإلكتروني غير موجود',
          ...deviceInfo
        }
      }).catch(err => console.error('Failed to log login attempt:', err));

      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          success: false,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          failureReason: `الحساب ${user.status}`,
          ...deviceInfo
        }
      }).catch(err => console.error('Failed to log login attempt:', err));

      return res.status(403).json({
        success: false,
        message: 'حسابك غير نشط. يرجى التواصل مع الدعم'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          success: false,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          failureReason: 'كلمة مرور خاطئة',
          ...deviceInfo
        }
      }).catch(err => console.error('Failed to log login attempt:', err));

      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getTokenExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        ...deviceInfo
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log successful login
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        ...deviceInfo,
        loginAt: new Date()
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
      error: error.message
    });
  }
};

// =============================================
// Refresh Access Token
// =============================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token مطلوب'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token غير صالح'
      });
    }

    // Check if token exists in database and not revoked
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        isRevoked: false,
        expiresAt: { gte: new Date() }
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token منتهي الصلاحية أو محظور'
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        preferences: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'الحساب غير نشط'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    res.json({
      success: true,
      message: 'تم تحديث Access token بنجاح',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الرمز',
      error: error.message
    });
  }
};

// =============================================
// Logout User
// =============================================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.userId;

    if (refreshToken) {
      // Revoke the specific refresh token
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId
        },
        data: {
          isRevoked: true
        }
      });
    } else {
      // Revoke all refresh tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true }
      });
    }

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الخروج',
      error: error.message
    });
  }
};

// =============================================
// Get Current User Profile
// =============================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};

// =============================================
// Update User Profile
// =============================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone, dateOfBirth, gender, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
            ...(gender && { gender }),
            ...(bio && { bio })
          }
        }
      },
      include: {
        profile: true,
        preferences: true
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحديث',
      error: error.message
    });
  }
};

// =============================================
// Update User Preferences
// =============================================
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          update: preferences
        }
      },
      include: {
        profile: true,
        preferences: true
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحديث',
      error: error.message
    });
  }
};

// =============================================
// Change Password
// =============================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    // Revoke all refresh tokens (force re-login on all devices)
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير كلمة المرور',
      error: error.message
    });
  }
};