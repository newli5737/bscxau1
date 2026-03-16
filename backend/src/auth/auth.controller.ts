import { Controller, Post, Get, Body, UseGuards, Req, Patch, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateBankDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.authService.register(dto, ip);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('captcha')
  getCaptcha() {
    return this.authService.getCaptcha();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bank')
  updateBank(@Req() req: any, @Body() dto: UpdateBankDto) {
    return this.authService.updateBank(req.user.id, dto.bankName, dto.bankAccountNumber, dto.bankAccountHolder);
  }

  @Get('support-url')
  getSupportUrl() {
    return { url: process.env.SUPPORT_URL || '' };
  }
}
