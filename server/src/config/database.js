// src/config/database.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// اختبار الاتصال
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL with Prisma');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// إغلاق الاتصال عند إيقاف التطبيق
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };