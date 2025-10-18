// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // إنشاء 10 مستخدمين تجريبيين متنوعين
  const users = [
    { email: 'superadmin@mishkat.com', password: await bcrypt.hash('superadmin123', 10), role: 'SUPER_ADMIN' },
    { email: 'admin1@mishkat.com', password: await bcrypt.hash('admin123', 10), role: 'ADMIN' },
    { email: 'admin2@mishkat.com', password: await bcrypt.hash('admin123', 10), role: 'ADMIN' },
    { email: 'mod1@mishkat.com', password: await bcrypt.hash('mod123', 10), role: 'MODERATOR' },
    { email: 'mod2@mishkat.com', password: await bcrypt.hash('mod123', 10), role: 'MODERATOR' },
    { email: 'user1@mishkat.com', password: await bcrypt.hash('user123', 10), role: 'CUSTOMER' },
    { email: 'user2@mishkat.com', password: await bcrypt.hash('user123', 10), role: 'CUSTOMER' },
    { email: 'user3@mishkat.com', password: await bcrypt.hash('user123', 10), role: 'CUSTOMER' },
    { email: 'user4@mishkat.com', password: await bcrypt.hash('user123', 10), role: 'CUSTOMER' },
    { email: 'user5@mishkat.com', password: await bcrypt.hash('user123', 10), role: 'CUSTOMER' }
  ];

  for (const user of users) {
    try {
      // Use upsert to avoid duplicates when re-running seed
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
      console.log(`✅ Created or exists user: ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed creating user ${user.email}:`, err.message || err);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });