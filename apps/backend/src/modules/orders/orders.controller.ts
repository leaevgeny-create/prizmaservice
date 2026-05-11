import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: any, @Request() req: any) {
    return this.ordersService.create(req.user.id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.ordersService.publish(id);
  }

  @Get('available')
  findAvailable() {
    return this.ordersService.findAvailable();
  }

  @Get('my')
  findMy(@Request() req: any) {
    return this.ordersService.findForCustomer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: { executorId: string }) {
    return this.ordersService.assignExecutor(id, dto.executorId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.ordersService.updateStatus(id, dto.status, req.user);
  }
}
