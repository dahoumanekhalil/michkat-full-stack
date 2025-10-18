// src/controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        preferences: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        // password excluded
      }
    });

    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المستخدمين',
      error: error.message
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        preferences: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        // password excluded
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المستخدم',
      error: error.message
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'CUSTOMER' } = req.body;

    // Check if user exists
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
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
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
            language: 'AR',
            theme: 'LIGHT'
          }
        }
      },
      include: {
        profile: true,
        preferences: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء المستخدم',
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, role, status } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
        profile: {
          update: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone })
          }
        }
      },
      include: {
        profile: true,
        preferences: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المستخدم',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Delete user (soft delete by updating status)
    await prisma.user.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date()
      }
    });

    // Or hard delete:
    // await prisma.user.delete({
    //   where: { id }
    // });

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المستخدم',
      error: error.message
    });
  }
};