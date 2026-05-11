import { Module } from '@nestjs/common';
import { GosuslugiService } from './gosuslugi.service';

@Module({ providers: [GosuslugiService], exports: [GosuslugiService] })
export class GosuslugiModule {}
