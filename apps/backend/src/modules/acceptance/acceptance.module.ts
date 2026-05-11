import { Module } from '@nestjs/common';
import { AcceptanceService } from './acceptance.service';
import { AcceptanceController } from './acceptance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AcceptanceController],
  providers: [AcceptanceService],
  exports: [AcceptanceService],
})
export class AcceptanceModule {}
