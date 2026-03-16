import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('investments')
export class InvestmentController {
  constructor(private investmentService: InvestmentService) {}

  @Get('products')
  getProducts() {
    return this.investmentService.getProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy/:productId')
  buyProduct(@Req() req: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.investmentService.buyProduct(req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyInvestments(@Req() req: any) {
    return this.investmentService.getUserInvestments(req.user.id);
  }
}
