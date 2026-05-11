import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('orders/:orderId/rating')
  submit(@Param('orderId') orderId: string, @Body() dto: any, @Request() req: any) {
    return this.ratingService.submitRating(orderId, req.user.id, dto);
  }

  @Get('rating/executor/:executorId')
  getExecutorSummary(@Param('executorId') executorId: string) {
    return this.ratingService.getExecutorRatingSummary(executorId);
  }
}
