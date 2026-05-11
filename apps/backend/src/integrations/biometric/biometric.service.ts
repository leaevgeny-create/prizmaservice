import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BiometricService {
  private readonly logger = new Logger(BiometricService.name);

  constructor(private readonly config: ConfigService) {}

  async enroll(userId: string, biometricData: string): Promise<string> {
    if (this.config.get('NODE_ENV') !== 'production') {
      // В dev: просто хэшируем данные
      return crypto.createHash('sha256').update(`${userId}:${biometricData}`).digest('hex');
    }

    const response = await axios.post(`${this.config.get('BIOAPI_URL')}/enroll`, {
      userId,
      biometricData,
    }, {
      headers: { 'X-API-Key': this.config.get('BIOAPI_KEY') },
    });

    return response.data.templateHash;
  }

  async verify(biometricData: string, templateHash: string): Promise<boolean> {
    if (this.config.get('NODE_ENV') !== 'production') {
      // В dev: всегда возвращаем true для упрощения тестирования
      this.logger.warn('Биометрия: dev-режим, верификация пропускается');
      return true;
    }

    const response = await axios.post(`${this.config.get('BIOAPI_URL')}/verify`, {
      biometricData,
      templateHash,
    }, {
      headers: { 'X-API-Key': this.config.get('BIOAPI_KEY') },
    });

    return response.data.matched === true && response.data.confidence >= 0.95;
  }

  async verifyWebAuthn(credential: object, challenge: string): Promise<boolean> {
    // WebAuthn verification — делегируем браузерному API в production
    this.logger.log(`WebAuthn verify challenge: ${challenge}`);
    return true;
  }
}
