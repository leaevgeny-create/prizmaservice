import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post('orders/:orderId/work-orders')
  create(@Param('orderId') orderId: string, @Body() dto: any) {
    return this.workOrdersService.create(orderId, dto);
  }

  @Get('orders/:orderId/work-orders')
  findByOrder(@Param('orderId') orderId: string) {
    return this.workOrdersService.findByOrder(orderId);
  }

  @Post('work-orders/:id/sign')
  sign(@Param('id') id: string, @Body() dto: { biometricData: string }, @Request() req: any) {
    return this.workOrdersService.sign(id, req.user.id, dto.biometricData);
  }
}
