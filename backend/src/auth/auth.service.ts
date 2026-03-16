import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';
import { createCanvas } from 'canvas';

@Injectable()
export class CaptchaService {
  private captchas = new Map<string, { answer: string; expiresAt: number }>();

  generate(): { id: string; image: string } {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 15) + 1;
    const ops = ['+', '-', 'x'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer: number;
    let question: string;
    switch (op) {
      case '+': answer = a + b; question = `${a} + ${b}`; break;
      case '-': answer = Math.max(a, b) - Math.min(a, b); question = `${Math.max(a, b)} - ${Math.min(a, b)}`; break;
      case 'x': answer = a * b; question = `${a} x ${b}`; break;
    }

    const id = randomBytes(16).toString('hex');
    this.captchas.set(id, { answer: String(answer), expiresAt: Date.now() + 5 * 60 * 1000 });

    // Generate captcha image using canvas
    const width = 200;
    const height = 70;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background with noise
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(0.5, '#16213e');
    bgGrad.addColorStop(1, '#0f3460');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Add noise dots
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add interference lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 200 + 50}, ${Math.random() * 200 + 50}, ${Math.random() * 200 + 50}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Draw text with random rotation per character
    const text = `${question} = ?`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const charWidth = width / (text.length + 2);
    const startX = charWidth * 1.5;

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const x = startX + i * charWidth;
      const y = height / 2 + (Math.random() - 0.5) * 12;
      const rotation = (Math.random() - 0.5) * 0.4;

      ctx.translate(x, y);
      ctx.rotate(rotation);

      const colors = ['#00f5d4', '#00bbf9', '#e2e8f0', '#67e8f9', '#a5f3fc'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.font = `bold ${22 + Math.floor(Math.random() * 8)}px Arial, sans-serif`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    const imageBase64 = canvas.toDataURL('image/png');
    return { id, image: imageBase64 };
  }

  validate(id: string, answer: string): boolean {
    const captcha = this.captchas.get(id);
    if (!captcha) return false;
    this.captchas.delete(id);
    if (Date.now() > captcha.expiresAt) return false;
    return captcha.answer === answer.trim();
  }
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private captchaService: CaptchaService,
  ) {}

  async register(dto: RegisterDto, ip: string) {
    // Validate captcha
    if (!this.captchaService.validate(dto.captchaId, dto.captchaAnswer)) {
      throw new BadRequestException('Mã captcha không đúng');
    }

    // Validate passwords match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu không khớp');
    }

    // Check IP limit (max 3 accounts per IP per 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ipCount = await this.prisma.ipRegistration.count({
      where: { ip, createdAt: { gte: twentyFourHoursAgo } },
    });
    if (ipCount >= 3) {
      throw new BadRequestException('Đã vượt quá giới hạn đăng ký. Vui lòng thử lại sau');
    }

    // Check username exists
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) throw new ConflictException('Tên đăng nhập đã tồn tại');

    // Validate referral code
    const inviter = await this.prisma.user.findUnique({ where: { referralCode: dto.referralCode } });
    if (!inviter) throw new BadRequestException('Mã giới thiệu không hợp lệ');

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Generate unique referral code
    const referralCode = randomBytes(4).toString('hex').toUpperCase();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        referralCode,
        invitedByUserId: inviter.id,
        registrationIp: ip,
        fingerprint: dto.fingerprint || null,
      },
    });

    // Record IP
    await this.prisma.ipRegistration.create({ data: { ip } });

    // Check fingerprint suspicious
    if (dto.fingerprint) {
      const fpCount = await this.prisma.user.count({ where: { fingerprint: dto.fingerprint } });
      if (fpCount > 2) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isSuspicious: true },
        });
      }
    }

    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username, referralCode: user.referralCode } };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user) throw new BadRequestException('Tên đăng nhập hoặc mật khẩu không đúng');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new BadRequestException('Tên đăng nhập hoặc mật khẩu không đúng');

    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        referralCode: user.referralCode,
        balance: user.balance,
        isAdmin: user.isAdmin,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, referralCode: true,
        balance: true, totalIncome: true, todayIncome: true,
        bankName: true, bankAccountNumber: true, bankAccountHolder: true,
        isAdmin: true, createdAt: true,
      },
    });
    return user;
  }

  async updateBank(userId: number, bankName: string, bankAccountNumber: string, bankAccountHolder: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { bankName, bankAccountNumber, bankAccountHolder },
      select: { bankName: true, bankAccountNumber: true, bankAccountHolder: true },
    });
  }

  getCaptcha() {
    return this.captchaService.generate();
  }
}
