import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('aggregator')
  aggregator() {
    return this.analyticsService.aggregatorDashboard();
  }

  @Get('customer/:customerId')
  customer(@Param('customerId') customerId: string) {
    return this.analyticsService.customerDashboard(customerId);
  }

  @Get('executor/:executorId')
  executor(@Param('executorId') executorId: string) {
    return this.analyticsService.executorDashboard(executorId);
  }
}
