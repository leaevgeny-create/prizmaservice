import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('orders/:orderId/disputes')
  create(@Param('orderId') orderId: string, @Body() dto: any, @Request() req: any) {
    return this.disputesService.create(orderId, req.user.id, dto);
  }

  @Get('orders/:orderId/disputes')
  findByOrder(@Param('orderId') orderId: string) {
    return this.disputesService.findByOrder(orderId);
  }

  @Post('disputes/:id/resolve')
  resolve(@Param('id') id: string, @Body() dto: { resolution: string }) {
    return this.disputesService.resolve(id, dto.resolution);
  }

  @Post('disputes/:id/messages')
  addMessage(@Param('id') id: string, @Body() dto: { text: string }, @Request() req: any) {
    return this.disputesService.addMessage(id, req.user.id, dto.text);
  }
}
