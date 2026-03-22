import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed admin user
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (existing) {
    // Update referral code if needed
    if (existing.referralCode !== 'ADMIN2026') {
      await prisma.user.update({ where: { id: existing.id }, data: { referralCode: 'ADMIN2026' } });
      console.log('✅ Admin referral code updated to ADMIN2026');
    } else {
      console.log('⚠️  Admin user already exists, skipping...');
    }
  } else {
    const passwordHash = await bcrypt.hash('Bscxau@2026', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        referralCode: 'ADMIN2026',
        isAdmin: true,
        registrationIp: '127.0.0.1',
      },
    });
    console.log(`✅ Admin user created (id: ${admin.id}, username: admin, password: Bscxau@2026)`);
  }

  // Seed BSCXAU VIP investment products
  // Delete investments first (FK constraint), then products
  await prisma.userInvestment.deleteMany({});
  await prisma.investmentProduct.deleteMany({});
  const products = [
    { name: 'BSCXAU VIP 1', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 100000, roiPercent: 30, dailyProfit: 30000, totalProfit: 2700000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 2', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 200000, roiPercent: 31, dailyProfit: 62000, totalProfit: 5580000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 3', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 500000, roiPercent: 33, dailyProfit: 165000, totalProfit: 14850000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 4', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 1000000, roiPercent: 35, dailyProfit: 350000, totalProfit: 31500000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 5', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 2000000, roiPercent: 37, dailyProfit: 740000, totalProfit: 66600000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 6', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 3000000, roiPercent: 39, dailyProfit: 1170000, totalProfit: 105300000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 7', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 5000000, roiPercent: 42, dailyProfit: 2100000, totalProfit: 189000000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 8', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 10000000, roiPercent: 45, dailyProfit: 4500000, totalProfit: 405000000, durationDays: 90, paymentDelayHours: 24 },
  ];
  for (const p of products) {
    await prisma.investmentProduct.create({ data: p });
  }
  console.log(`✅ Created ${products.length} BSCXAU VIP products (100k - 10M)`);

  // Seed sample tasks
  const taskCount = await prisma.task.count();
  if (taskCount === 0) {
    const tasks = [
      { title: 'Xem quảng cáo', description: 'Xem video quảng cáo 30 giây', reward: 5000, taskType: 'web_view' },
      { title: 'Truy cập website đối tác', description: 'Nhấn vào link và ở lại 10 giây', reward: 3000, taskType: 'click_link' },
      { title: 'AI Trading Demo', description: 'Thực hiện giao dịch thử với AI', reward: 10000, taskType: 'ai_trading' },
      { title: 'Đọc bài viết', description: 'Đọc bài viết về đầu tư', reward: 2000, taskType: 'web_view' },
    ];
    for (const t of tasks) {
      await prisma.task.create({ data: t });
    }
    console.log(`✅ Created ${tasks.length} tasks`);
  } else {
    console.log('⚠️  Tasks already exist, skipping...');
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
