import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentService {
  constructor(private prisma: PrismaService) {}

  async getProducts() {
    return this.prisma.investmentProduct.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async buyProduct(userId: number, productId: number) {
    const product = await this.prisma.investmentProduct.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new BadRequestException('Gói đầu tư không tồn tại');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.balance < product.price) throw new BadRequestException('Số dư không đủ');

    // Deduct balance and create investment
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + product.durationDays);

    const [investment] = await this.prisma.$transaction([
      this.prisma.userInvestment.create({
        data: {
          userId,
          productId,
          amount: product.price,
          dailyProfit: product.dailyProfit,
          totalProfit: product.totalProfit,
          endDate,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: product.price } },
      }),
    ]);

    // Process referral commissions
    await this.processCommissions(userId, product.price);

    return investment;
  }

  private async processCommissions(userId: number, amount: number) {
    const rates = [0.32, 0.03, 0.01]; // F1: 32%, F2: 3%, F3: 1%
    let currentUserId = userId;

    for (let level = 1; level <= 3; level++) {
      const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
      if (!user || !user.invitedByUserId) break;

      const inviterId = user.invitedByUserId;
      const commission = amount * rates[level - 1];

      // Only give commission if F1 has invested at least one package
      if (level === 1) {
        const hasInvestment = await this.prisma.userInvestment.findFirst({
          where: { userId },
        });
        // This is the first investment, commission is valid
      }

      await this.prisma.$transaction([
        this.prisma.commissionRecord.create({
          data: {
            userId: inviterId,
            fromUserId: userId,
            level,
            amount: commission,
            type: 'investment',
          },
        }),
        this.prisma.user.update({
          where: { id: inviterId },
          data: {
            balance: { increment: commission },
            totalIncome: { increment: commission },
            todayIncome: { increment: commission },
          },
        }),
      ]);

      currentUserId = inviterId;
    }
  }

  async getUserInvestments(userId: number) {
    return this.prisma.userInvestment.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { startDate: 'desc' },
    });
  }
}
