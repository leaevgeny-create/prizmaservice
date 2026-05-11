import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WeatherIntegrationModule } from '../../integrations/weather/weather.module';

@Module({
  imports: [PrismaModule, WeatherIntegrationModule],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
