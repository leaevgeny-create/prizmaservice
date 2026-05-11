import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WeatherData {
  temperature: number;      // °C
  windSpeed: number;        // м/с
  precipitation: number;    // мм
  description: string;
  isAdverseForWork: boolean; // Неблагоприятные условия для работ
}

// Критерии неблагоприятных условий для малярных и фасадных работ
const ADVERSE_CONDITIONS = {
  tempMin: 5,         // Ниже +5°C малярка не производится
  tempMax: 35,        // Выше +35°C перегрев
  windMaxMs: 10,      // Ветер > 10 м/с
  precipitationMm: 1, // Любые осадки
};

@Injectable()
export class WeatherIntegrationService {
  private readonly logger = new Logger(WeatherIntegrationService.name);

  constructor(private readonly config: ConfigService) {}

  async getWeatherForLocation(lat: number, lng: number, date?: Date): Promise<WeatherData> {
    if (this.config.get('NODE_ENV') !== 'production') {
      return this.mockWeatherData();
    }

    const apiKey = this.config.get('OPENWEATHER_API_KEY');
    const url = date
      ? `https://api.openweathermap.org/data/3.0/onecall/timemachine`
      : `https://api.openweathermap.org/data/2.5/weather`;

    const params: any = { lat, lon: lng, appid: apiKey, units: 'metric', lang: 'ru' };
    if (date) params.dt = Math.floor(date.getTime() / 1000);

    const response = await axios.get(url, { params });
    const weather = date ? response.data.data[0] : response.data;

    return this.parseWeatherResponse(weather);
  }

  async validateWeatherStop(
    lat: number,
    lng: number,
    date: Date,
  ): Promise<{ confirmed: boolean; data: WeatherData }> {
    const data = await this.getWeatherForLocation(lat, lng, date);
    return { confirmed: data.isAdverseForWork, data };
  }

  private parseWeatherResponse(weather: any): WeatherData {
    const temp = weather.main?.temp ?? weather.temp ?? 0;
    const windSpeed = weather.wind?.speed ?? weather.wind_speed ?? 0;
    const precipitation =
      (weather.rain?.['1h'] ?? 0) + (weather.snow?.['1h'] ?? 0);
    const description = weather.weather?.[0]?.description ?? '';

    const isAdverseForWork =
      temp < ADVERSE_CONDITIONS.tempMin ||
      temp > ADVERSE_CONDITIONS.tempMax ||
      windSpeed > ADVERSE_CONDITIONS.windMaxMs ||
      precipitation > ADVERSE_CONDITIONS.precipitationMm;

    return { temperature: temp, windSpeed, precipitation, description, isAdverseForWork };
  }

  private mockWeatherData(): WeatherData {
    return {
      temperature: 3,
      windSpeed: 12,
      precipitation: 2.5,
      description: 'снег с дождём',
      isAdverseForWork: true,
    };
  }
}
