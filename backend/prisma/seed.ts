import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed admin user
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (existing) {
    console.log('⚠️  Admin user already exists, skipping...');
  } else {
    const passwordHash = await bcrypt.hash('Bscxau@2026', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        referralCode: 'ADMIN2024',
        isAdmin: true,
        registrationIp: '127.0.0.1',
      },
    });
    console.log(`✅ Admin user created (id: ${admin.id}, username: admin, password: Bscxau@2026)`);
  }

  // Seed BSCXAU VIP investment products
  // Delete existing products and re-create
  await prisma.investmentProduct.deleteMany({});
  const products = [
    { name: 'BSCXAU VIP 1', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 60000, roiPercent: 31, dailyProfit: 18600, totalProfit: 1674000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 2', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 120000, roiPercent: 32, dailyProfit: 38400, totalProfit: 3456000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 3', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 200000, roiPercent: 33, dailyProfit: 66000, totalProfit: 5940000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 4', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 400000, roiPercent: 35, dailyProfit: 140000, totalProfit: 12600000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 5', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 600000, roiPercent: 37, dailyProfit: 222000, totalProfit: 19980000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 6', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 1000000, roiPercent: 39, dailyProfit: 390000, totalProfit: 35100000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 7', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 2000000, roiPercent: 42, dailyProfit: 840000, totalProfit: 75600000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 8', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 3000000, roiPercent: 45, dailyProfit: 1350000, totalProfit: 121500000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 9', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 5000000, roiPercent: 48, dailyProfit: 2400000, totalProfit: 216000000, durationDays: 90, paymentDelayHours: 24 },
    { name: 'BSCXAU VIP 10', description: 'Gói đầu tư vàng BSCXAU – Tối ưu lợi nhuận bằng công nghệ AI', price: 10000000, roiPercent: 50, dailyProfit: 5000000, totalProfit: 450000000, durationDays: 90, paymentDelayHours: 24 },
  ];
  for (const p of products) {
    await prisma.investmentProduct.create({ data: p });
  }
  console.log(`✅ Created ${products.length} BSCXAU VIP products`);

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
