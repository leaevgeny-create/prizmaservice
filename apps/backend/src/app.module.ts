import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DefectsModule } from './modules/defects/defects.module';
import { AcceptanceModule } from './modules/acceptance/acceptance.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';
import { WeatherModule } from './modules/weather/weather.module';
import { RatingModule } from './modules/rating/rating.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    OrdersModule,
    DefectsModule,
    AcceptanceModule,
    DocumentsModule,
    MaterialsModule,
    WorkOrdersModule,
    GeolocationModule,
    WeatherModule,
    RatingModule,
    AnalyticsModule,
    DisputesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
