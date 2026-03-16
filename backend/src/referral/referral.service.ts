import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(userId: number) {
    // Get F1 (direct referrals)
    const f1Users = await this.prisma.user.findMany({
      where: { invitedByUserId: userId },
      select: { id: true, username: true, createdAt: true },
    });

    // Get F2 (referrals of F1)
    const f1Ids = f1Users.map(u => u.id);
    const f2Users = f1Ids.length > 0 ? await this.prisma.user.findMany({
      where: { invitedByUserId: { in: f1Ids } },
      select: { id: true, username: true, createdAt: true },
    }) : [];

    // Get F3 (referrals of F2)
    const f2Ids = f2Users.map(u => u.id);
    const f3Users = f2Ids.length > 0 ? await this.prisma.user.findMany({
      where: { invitedByUserId: { in: f2Ids } },
      select: { id: true, username: true, createdAt: true },
    }) : [];

    // Get commission stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getCommissionStats = async (level: number) => {
      const total = await this.prisma.commissionRecord.aggregate({
        where: { userId, level },
        _sum: { amount: true },
      });
      const todayCommission = await this.prisma.commissionRecord.aggregate({
        where: { userId, level, createdAt: { gte: today } },
        _sum: { amount: true },
      });
      return {
        total: total._sum.amount || 0,
        today: todayCommission._sum.amount || 0,
      };
    };

    const [lvl1Stats, lvl2Stats, lvl3Stats] = await Promise.all([
      getCommissionStats(1),
      getCommissionStats(2),
      getCommissionStats(3),
    ]);

    // Total today commission
    const todayTotal = lvl1Stats.today + lvl2Stats.today + lvl3Stats.today;
    const totalIncome = lvl1Stats.total + lvl2Stats.total + lvl3Stats.total;

    return {
      totalReferrals: f1Users.length + f2Users.length + f3Users.length,
      todayCommission: todayTotal,
      totalIncome,
      levels: [
        { level: 1, count: f1Users.length, todayCommission: lvl1Stats.today, totalIncome: lvl1Stats.total, rate: '32%' },
        { level: 2, count: f2Users.length, todayCommission: lvl2Stats.today, totalIncome: lvl2Stats.total, rate: '3%' },
        { level: 3, count: f3Users.length, todayCommission: lvl3Stats.today, totalIncome: lvl3Stats.total, rate: '1%' },
      ],
    };
  }
}
