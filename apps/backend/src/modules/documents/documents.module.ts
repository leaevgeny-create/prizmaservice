import { Module } from '@nestjs/common';
import { DocumentGeneratorService } from './document-generator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DocumentGeneratorService],
  exports: [DocumentGeneratorService],
})
export class DocumentsModule {}
