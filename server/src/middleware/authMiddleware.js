// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =============================================
// Verify JWT Token
// =============================================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'رمز غير صالح'
      });
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        preferences: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'حسابك غير نشط. يرجى التواصل مع الدعم'
      });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: 'تم تغيير كلمة المرور مؤخراً. يرجى تسجيل الدخول مرة أخرى'
        });
      }
    }

    // Grant access
    req.user = decoded;
    req.userFullData = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في التحقق من الصلاحيات',
      error: error.message
    });
  }
};

// =============================================
// Authorize Roles
// =============================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة'
      });
    }
    next();
  };
};

// =============================================
// Check if user is Admin (any admin role)
// =============================================
exports.isAdmin = (req, res, next) => {
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'];
  
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'الوصول مقتصر على المديرين فقط'
    });
  }
  next();
};

// =============================================
// Check if user is Super Admin
// =============================================
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'الوصول مقتصر على المدير الرئيسي فقط'
    });
  }
  next();
};

// =============================================
// Optional Authentication (for public routes that can show user-specific data)
// =============================================
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // Try to verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true,
          preferences: true
        }
      });

      if (user && user.status === 'ACTIVE') {
        req.user = decoded;
        req.userFullData = user;
      }
    } catch (error) {
      // Token invalid or expired, continue without authentication
    }

    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// =============================================
// Check if user owns the resource
// =============================================
exports.checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب'
      });
    }

    // Admin can access any resource
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'];
    if (adminRoles.includes(req.user.role)) {
      return next();
    }

    // Regular user can only access their own resources
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    }

    next();
  };
};

// =============================================
// Rate Limiting Helper
// =============================================
const rateLimitStore = new Map();

exports.rateLimit = (options = {}) => {
  const {
    windowMs = 15, // 15 minutes
    maxRequests = 100,
    message = 'تم تجاوز عدد الطلبات المسموح. يرجى المحاولة لاحقاً'
  } = options;

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(identifier)) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userData = rateLimitStore.get(identifier);

    if (now > userData.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((userData.resetTime - now) / 1000)
      });
    }

    userData.count++;
    next();
  };
};

// Clean up old rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

// =============================================
// Log Admin Activity
// =============================================
exports.logAdminActivity = (action, entity) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after response
    res.send = function (data) {
      // Only log if request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log admin activity (don't wait for it)
        prisma.adminActivityLog.create({
          data: {
            adminId: req.user.userId,
            action,
            entity,
            entityId: req.params.id || req.body.id || null,
            description: `${action} ${entity}`,
            metadata: {
              body: req.body,
              params: req.params,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        }).catch(err => console.error('Failed to log admin activity:', err));
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};