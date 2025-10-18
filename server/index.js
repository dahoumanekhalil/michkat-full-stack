// index.js
require('./src/app');


// // index.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { PrismaClient } = require('@prisma/client');

// // Initialize Express
// const app = express();
// const prisma = new PrismaClient();

// // =============================================
// // Middleware
// // =============================================

// // CORS Configuration
// const corsOptions = {
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true,
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));

// // Body Parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Trust proxy (for getting real IP behind reverse proxy)
// app.set('trust proxy', 1);

// // Request Logger (Development)
// if (process.env.NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     next();
//   });
// }

// // =============================================
// // Routes
// // =============================================

// // Health Check
// app.get('/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // API Routes
// app.use('/api/auth', require('./routes/authRoutes'));

// // 404 Handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'المسار غير موجود'
//   });
// });

// // =============================================
// // Global Error Handler
// // =============================================
// app.use((err, req, res, next) => {
//   console.error('Error:', err);

//   // Prisma Errors
//   if (err.code === 'P2002') {
//     return res.status(400).json({
//       success: false,
//       message: 'البيانات موجودة مسبقاً',
//       field: err.meta?.target
//     });
//   }

//   if (err.code === 'P2025') {
//     return res.status(404).json({
//       success: false,
//       message: 'البيانات غير موجودة'
//     });
//   }

//   // JWT Errors
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       success: false,
//       message: 'رمز غير صالح'
//     });
//   }

//   if (err.name === 'TokenExpiredError') {
//     return res.status(401).json({
//       success: false,
//       message: 'انتهت صلاحية الرمز'
//     });
//   }

//   // Default Error
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'حدث خطأ في الخادم',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // =============================================
// // Database Connection Test
// // =============================================
// async function testDatabaseConnection() {
//   try {
//     await prisma.$connect();
//     console.log('✅ Database connected successfully');
//   } catch (error) {
//     console.error('❌ Database connection failed:', error);
//     process.exit(1);
//   }
// }

// // =============================================
// // Graceful Shutdown
// // =============================================
// async function gracefulShutdown(signal) {
//   console.log(`\n${signal} received. Starting graceful shutdown...`);
  
//   try {
//     await prisma.$disconnect();
//     console.log('✅ Database disconnected');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error during shutdown:', error);
//     process.exit(1);
//   }
// }

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// // =============================================
// // Start Server
// // =============================================
// const PORT = process.env.PORT || 5000;

// async function startServer() {
//   try {
//     // Test database connection
//     await testDatabaseConnection();

//     // Start server
//     app.listen(PORT, () => {
//       console.log('═══════════════════════════════════════');
//       console.log(`🚀 Server is running on port ${PORT}`);
//       console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
//       console.log(`🌍 API Base URL: http://localhost:${PORT}/api`);
//       console.log(`💚 Health Check: http://localhost:${PORT}/health`);
//       console.log('═══════════════════════════════════════');
//     });
//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// }

// startServer();