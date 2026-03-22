import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ===== USERS =====
  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, referralCode: true, balance: true,
          totalIncome: true, isAdmin: true, isSuspicious: true,
          registrationIp: true, fingerprint: true, createdAt: true,
          _count: { select: { referrals: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateUserReferralCode(userId: number, referralCode: string) {
    referralCode = referralCode.trim().toUpperCase();
    if (referralCode.length < 3) throw new BadRequestException('Mã giới thiệu phải có ít nhất 3 ký tự');
    const existing = await this.prisma.user.findUnique({ where: { referralCode } });
    if (existing && existing.id !== userId) throw new BadRequestException('Mã giới thiệu đã tồn tại');
    return this.prisma.user.update({
      where: { id: userId },
      data: { referralCode },
      select: { id: true, username: true, referralCode: true },
    });
  }

  async getReferralTree(userId: number) {
    const buildTree = async (id: number, depth = 0): Promise<any> => {
      if (depth >= 3) return [];
      const children = await this.prisma.user.findMany({
        where: { invitedByUserId: id },
        select: { id: true, username: true, createdAt: true, balance: true },
      });
      return Promise.all(children.map(async (child) => ({
        ...child,
        level: depth + 1,
        children: await buildTree(child.id, depth + 1),
      })));
    };
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
    return { ...user, children: await buildTree(userId) };
  }

  // ===== INVESTMENT PRODUCTS =====
  async getProducts() {
    return this.prisma.investmentProduct.findMany({ orderBy: { price: 'asc' } });
  }

  async createProduct(data: any) {
    return this.prisma.investmentProduct.create({ data });
  }

  async updateProduct(id: number, data: any) {
    return this.prisma.investmentProduct.update({ where: { id }, data });
  }

  async deleteProduct(id: number) {
    return this.prisma.investmentProduct.update({ where: { id }, data: { isActive: false } });
  }

  // ===== TASKS =====
  async getTasks() {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createTask(data: any) {
    return this.prisma.task.create({ data });
  }

  async updateTask(id: number, data: any) {
    return this.prisma.task.update({ where: { id }, data });
  }

  async getPendingTaskCompletions() {
    return this.prisma.taskCompletion.findMany({
      where: { status: 'pending' },
      include: { user: { select: { username: true } }, task: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveTaskCompletion(id: number) {
    const completion = await this.prisma.taskCompletion.findUnique({
      where: { id },
      include: { task: true },
    });
    if (!completion) throw new BadRequestException('Không tìm thấy');
    if (completion.status !== 'pending') throw new BadRequestException('Đã được xử lý');

    await this.prisma.$transaction([
      this.prisma.taskCompletion.update({ where: { id }, data: { status: 'approved' } }),
      this.prisma.user.update({
        where: { id: completion.userId },
        data: {
          balance: { increment: completion.task.reward },
          totalIncome: { increment: completion.task.reward },
          todayIncome: { increment: completion.task.reward },
        },
      }),
    ]);
    return { message: 'Đã duyệt' };
  }

  async rejectTaskCompletion(id: number) {
    return this.prisma.taskCompletion.update({ where: { id }, data: { status: 'rejected' } });
  }

  // ===== DEPOSITS =====
  async getPendingDeposits() {
    return this.prisma.depositOrder.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { username: true } },
        bankAccount: { select: { bankName: true, accountNumber: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveDeposit(id: number) {
    const deposit = await this.prisma.depositOrder.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!deposit) throw new BadRequestException('Không tìm thấy');
    if (deposit.status !== 'pending') throw new BadRequestException('Đã được xử lý');

    if (deposit.productId && deposit.product) {
      // Auto-purchase the investment product
      const product = deposit.product;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.durationDays);

      await this.prisma.$transaction([
        this.prisma.depositOrder.update({ where: { id }, data: { status: 'approved' } }),
        this.prisma.userInvestment.create({
          data: {
            userId: deposit.userId,
            productId: product.id,
            amount: product.price,
            dailyProfit: product.dailyProfit,
            totalProfit: product.totalProfit,
            startDate,
            endDate,
          },
        }),
      ]);
      return { message: `Đã duyệt nạp tiền và tự động mua ${product.name}` };
    } else {
      // Regular deposit — add to balance
      await this.prisma.$transaction([
        this.prisma.depositOrder.update({ where: { id }, data: { status: 'approved' } }),
        this.prisma.user.update({
          where: { id: deposit.userId },
          data: { balance: { increment: deposit.amount } },
        }),
      ]);
      return { message: 'Đã duyệt nạp tiền' };
    }
  }

  async rejectDeposit(id: number, note: string = 'Chưa đủ điều kiện') {
    return this.prisma.depositOrder.update({ where: { id }, data: { status: 'rejected', adminNote: note } });
  }

  // ===== WITHDRAWALS =====
  async getPendingWithdrawals() {
    return this.prisma.withdrawRequest.findMany({
      where: { status: 'pending' },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveWithdrawal(id: number) {
    const withdrawal = await this.prisma.withdrawRequest.findUnique({ where: { id } });
    if (!withdrawal) throw new BadRequestException('Không tìm thấy');
    if (withdrawal.status !== 'pending') throw new BadRequestException('Đã được xử lý');

    const user = await this.prisma.user.findUnique({ where: { id: withdrawal.userId } });
    if (!user || user.balance < withdrawal.amount) {
      throw new BadRequestException('Số dư không đủ');
    }

    await this.prisma.$transaction([
      this.prisma.withdrawRequest.update({ where: { id }, data: { status: 'approved' } }),
      this.prisma.user.update({
        where: { id: withdrawal.userId },
        data: { balance: { decrement: withdrawal.amount } },
      }),
    ]);
    return { message: 'Đã duyệt rút tiền' };
  }

  async rejectWithdrawal(id: number, note: string = 'Chưa đủ điều kiện') {
    return this.prisma.withdrawRequest.update({ where: { id }, data: { status: 'rejected', adminNote: note } });
  }

  // ===== STATS =====
  async getStats() {
    const [totalUsers, totalDeposits, totalWithdrawals, totalInvestments, suspiciousUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.depositRequest.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
      this.prisma.withdrawRequest.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
      this.prisma.userInvestment.aggregate({ _sum: { amount: true } }),
      this.prisma.user.count({ where: { isSuspicious: true } }),
    ]);

    // IP stats
    const ipStats = await this.prisma.ipRegistration.groupBy({
      by: ['ip'],
      _count: true,
      orderBy: { _count: { ip: 'desc' } },
      take: 20,
    });

    return {
      totalUsers,
      totalDeposits: totalDeposits._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      totalInvestments: totalInvestments._sum.amount || 0,
      suspiciousUsers,
      topIps: ipStats.map(i => ({ ip: i.ip, count: i._count })),
    };
  }

  // ===== ADMIN BANK ACCOUNTS =====
  async getBankAccounts() {
    return this.prisma.adminBankAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createBankAccount(data: { bankCode: string; bankName: string; accountNumber: string; accountHolder: string }) {
    return this.prisma.adminBankAccount.create({ data });
  }

  async updateBankAccount(id: number, data: any) {
    return this.prisma.adminBankAccount.update({ where: { id }, data });
  }

  async deleteBankAccount(id: number) {
    return this.prisma.adminBankAccount.update({ where: { id }, data: { isActive: false } });
  }

  // ===== USER INVESTMENTS =====
  async getAllInvestments() {
    return this.prisma.userInvestment.findMany({
      include: {
        user: { select: { username: true } },
        product: { select: { name: true, price: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  // ===== BALANCE ADJUSTMENT =====
  async adjustBalance(userId: number, amount: number, note?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const newBalance = user.balance + amount;
    if (newBalance < 0) throw new BadRequestException('Số dư không thể âm');

    await this.prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    return { message: `Đã điều chỉnh số dư ${amount >= 0 ? '+' : ''}${amount.toLocaleString()} cho ${user.username}. Số dư mới: ${newBalance.toLocaleString()}` };
  }

  // ===== SUPPORT URL =====
  getSupportUrl() {
    return { url: process.env.SUPPORT_URL || '' };
  }

  setSupportUrl(url: string) {
    process.env.SUPPORT_URL = url;
    return { message: 'Đã cập nhật link hỗ trợ', url };
  }
}
