import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherIntegrationService } from '../../integrations/weather/weather.service';

@Injectable()
export class WeatherService {
  constructor(
    private prisma: PrismaService,
    private weatherIntegration: WeatherIntegrationService,
  ) {}

  async report(orderId: string, userId: string, data: { lat: number; lng: number; reason: string }) {
    const weather = await this.weatherIntegration.getWeatherForLocation(data.lat, data.lng);
    return this.prisma.weatherStop.create({
      data: { orderId, reportedById: userId, reason: data.reason, weatherSnapshot: weather as any },
    });
  }

  approve(id: string) {
    return this.prisma.weatherStop.update({ where: { id }, data: { approved: true } });
  }
}
