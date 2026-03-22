import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationGateway,
  ) {}

  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, totalIncome: true, todayIncome: true },
    });
    return user;
  }

  async createDepositOrder(userId: number, amount: number, productId?: number) {
    if (amount <= 0) throw new BadRequestException('Số tiền không hợp lệ');

    // If buying a product, validate it exists and use its price
    if (productId) {
      const product = await this.prisma.investmentProduct.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) throw new BadRequestException('Gói đầu tư không tồn tại');
      amount = product.price;
    }

    // Get a random active admin bank account
    const bankAccounts = await this.prisma.adminBankAccount.findMany({
      where: { isActive: true },
    });
    if (bankAccounts.length === 0) {
      throw new BadRequestException('Hệ thống chưa có tài khoản ngân hàng. Vui lòng liên hệ admin');
    }

    const bankAccount = bankAccounts[Math.floor(Math.random() * bankAccounts.length)];

    // Generate unique transfer content
    const code = randomBytes(3).toString('hex').toUpperCase();
    const transferContent = `BSCXAU ${code}`;

    // Create deposit order with 10-min expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const order = await this.prisma.depositOrder.create({
      data: {
        userId,
        bankAccountId: bankAccount.id,
        amount,
        transferContent,
        expiresAt,
        productId: productId || null,
      },
      include: {
        bankAccount: {
          select: { bankCode: true, bankName: true, accountNumber: true, accountHolder: true },
        },
      },
    });

    // Build SePay QR URL
    const qrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(bankAccount.accountNumber)}&bank=${encodeURIComponent(bankAccount.bankCode)}&amount=${amount}&des=${encodeURIComponent(transferContent)}&template=compact`;

    // Notify admin
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    this.notification.notifyAdmin('new-deposit', {
      username: user?.username,
      amount: order.amount,
      productName: productId ? (await this.prisma.investmentProduct.findUnique({ where: { id: productId } }))?.name : null,
      transferContent: order.transferContent,
    });

    return {
      id: order.id,
      amount: order.amount,
      transferContent: order.transferContent,
      expiresAt: order.expiresAt,
      qrUrl,
      bankAccount: order.bankAccount,
    };
  }

  async getDepositOrder(orderId: number, userId: number) {
    const order = await this.prisma.depositOrder.findFirst({
      where: { id: orderId, userId },
      include: {
        bankAccount: {
          select: { bankCode: true, bankName: true, accountNumber: true, accountHolder: true },
        },
      },
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn nạp');

    const qrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(order.bankAccount.accountNumber)}&bank=${encodeURIComponent(order.bankAccount.bankCode)}&amount=${order.amount}&des=${encodeURIComponent(order.transferContent)}&template=compact`;

    // Check if expired
    const isExpired = new Date() > order.expiresAt;
    if (isExpired && order.status === 'pending') {
      await this.prisma.depositOrder.update({ where: { id: orderId }, data: { status: 'expired' } });
    }

    return {
      id: order.id,
      amount: order.amount,
      transferContent: order.transferContent,
      expiresAt: order.expiresAt,
      status: isExpired && order.status === 'pending' ? 'expired' : order.status,
      qrUrl,
      bankAccount: order.bankAccount,
    };
  }

  // Keep old deposit request for backward compatibility
  async requestDeposit(userId: number, amount: number) {
    if (amount <= 0) throw new BadRequestException('Số tiền không hợp lệ');
    return this.prisma.depositRequest.create({
      data: { userId, amount },
    });
  }

  async requestWithdraw(userId: number, amount: number) {
    if (amount <= 0) throw new BadRequestException('Số tiền không hợp lệ');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.balance < amount) throw new BadRequestException('Số dư không đủ');

    const hasInvestment = await this.prisma.userInvestment.findFirst({ where: { userId } });
    if (!hasInvestment) {
      throw new BadRequestException('Bạn cần đầu tư ít nhất 1 gói để rút tiền');
    }

    if (!user.bankName || !user.bankAccountNumber || !user.bankAccountHolder) {
      throw new BadRequestException('Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền');
    }

    const withdraw = await this.prisma.withdrawRequest.create({
      data: {
        userId,
        amount,
        bankName: user.bankName,
        bankAccountNumber: user.bankAccountNumber,
        bankAccountHolder: user.bankAccountHolder,
      },
    });

    this.notification.notifyAdmin('new-withdraw', {
      username: user.username,
      amount,
    });

    return withdraw;
  }

  async getDepositHistory(userId: number) {
    return this.prisma.depositOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        bankAccount: { select: { bankCode: true, bankName: true, accountNumber: true } },
      },
    });
  }

  async getWithdrawHistory(userId: number) {
    return this.prisma.withdrawRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
