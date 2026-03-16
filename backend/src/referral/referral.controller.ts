import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('referral')
@UseGuards(JwtAuthGuard)
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('team')
  getTeamStats(@Req() req: any) {
    return this.referralService.getTeamStats(req.user.id);
  }
}
