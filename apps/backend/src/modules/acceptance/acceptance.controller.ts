import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AcceptanceService } from './acceptance.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class AcceptanceController {
  constructor(private readonly acceptanceService: AcceptanceService) {}

  @Post('orders/:orderId/acceptance')
  create(@Param('orderId') orderId: string, @Body() dto: any) {
    return this.acceptanceService.create(orderId, dto);
  }

  @Get('orders/:orderId/acceptance')
  findByOrder(@Param('orderId') orderId: string) {
    return this.acceptanceService.findByOrder(orderId);
  }

  @Post('acceptance/:id/approve')
  approve(@Param('id') id: string, @Body() dto: { biometricData: string }) {
    return this.acceptanceService.approve(id, dto.biometricData);
  }

  @Post('acceptance/:id/reject')
  reject(@Param('id') id: string, @Body() dto: any) {
    return this.acceptanceService.reject(id, dto);
  }
}
