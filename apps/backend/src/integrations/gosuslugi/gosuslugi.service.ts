import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GosuslugiUserData {
  sub: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  inn?: string;
  snils?: string;
  selfEmployedStatus?: boolean;
}

@Injectable()
export class GosuslugiService {
  private readonly logger = new Logger(GosuslugiService.name);

  constructor(private readonly config: ConfigService) {}

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.get('ESIA_CLIENT_ID', 'demo'),
      response_type: 'code',
      scope: 'fullname inn snils email contacts',
      redirect_uri: `${this.config.get('FRONTEND_URL')}/auth/gosuslugi/callback`,
      state,
    });
    return `${this.config.get('ESIA_AUTH_URL')}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<GosuslugiUserData> {
    // В dev-режиме возвращаем моковые данные
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.warn('Используется мок Госуслуг (dev-режим)');
      return this.mockUserData();
    }

    const tokenResponse = await axios.post(this.config.get('ESIA_TOKEN_URL')!, {
      client_id: this.config.get('ESIA_CLIENT_ID'),
      client_secret: this.config.get('ESIA_CLIENT_SECRET'),
      grant_type: 'authorization_code',
      code,
    });

    const accessToken = tokenResponse.data.access_token;
    const userInfo = await axios.get(this.config.get('ESIA_INFO_URL')!, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      sub: userInfo.data.sub,
      firstName: userInfo.data.firstName,
      lastName: userInfo.data.lastName,
      middleName: userInfo.data.middleName,
      email: userInfo.data.email,
      inn: userInfo.data.inn,
      snils: userInfo.data.snils,
      selfEmployedStatus: userInfo.data.selfEmployedStatus === true,
    };
  }

  async verifySelfEmployed(inn: string): Promise<{ isActive: boolean; registrationDate?: string }> {
    if (this.config.get('NODE_ENV') !== 'production') {
      return { isActive: true, registrationDate: '2022-01-15' };
    }
    // В prod: запрос к API ФНС/Госуслуг
    const response = await axios.get(`https://statusnpd.nalog.ru/api/v1/tracker/taxpayer_status`, {
      params: { inn },
    });
    return { isActive: response.data.status === 'ACTIVE' };
  }

  private mockUserData(): GosuslugiUserData {
    return {
      sub: `mock_${Date.now()}`,
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Иванович',
      email: `mock_${Date.now()}@gosuslugi.ru`,
      inn: '772312345678',
      snils: '123-456-789 00',
      selfEmployedStatus: true,
    };
  }
}
