import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Post('check-in')
  checkIn(@Body() dto: { orderId: string; lat: number; lng: number }, @Request() req: any) {
    return this.geolocationService.checkIn(req.user.id, dto.orderId, dto.lat, dto.lng);
  }

  @Get('orders/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.geolocationService.findByOrder(orderId);
  }
}
