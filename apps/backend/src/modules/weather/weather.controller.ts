import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('orders/:orderId/weather-stop')
  report(@Param('orderId') orderId: string, @Body() dto: any, @Request() req: any) {
    return this.weatherService.report(orderId, req.user.id, dto);
  }

  @Post('weather-stops/:id/approve')
  approve(@Param('id') id: string) {
    return this.weatherService.approve(id);
  }
}
