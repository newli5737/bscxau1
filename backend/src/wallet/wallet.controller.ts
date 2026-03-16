import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber, Min } from 'class-validator';

class AmountDto {
  @IsNumber()
  @Min(1)
  amount: number;

  productId?: number;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  getBalance(@Req() req: any) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('deposit')
  createDepositOrder(@Req() req: any, @Body() dto: AmountDto) {
    return this.walletService.createDepositOrder(req.user.id, dto.amount, dto.productId);
  }

  @Get('deposit-order/:id')
  getDepositOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.walletService.getDepositOrder(id, req.user.id);
  }

  @Post('withdraw')
  requestWithdraw(@Req() req: any, @Body() dto: AmountDto) {
    return this.walletService.requestWithdraw(req.user.id, dto.amount);
  }

  @Get('deposits')
  getDepositHistory(@Req() req: any) {
    return this.walletService.getDepositHistory(req.user.id);
  }

  @Get('withdrawals')
  getWithdrawHistory(@Req() req: any) {
    return this.walletService.getWithdrawHistory(req.user.id);
  }
}
