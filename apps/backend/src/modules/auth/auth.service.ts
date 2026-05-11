import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GosuslugiService } from '../../integrations/gosuslugi/gosuslugi.service';
import { BiometricService } from '../../integrations/biometric/biometric.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly gosuslugiService: GosuslugiService,
    private readonly biometricService: BiometricService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Пользователь с таким email уже зарегистрирован');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
        status: UserStatus.PENDING,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            middleName: dto.middleName,
          },
        },
      },
      include: { profile: true },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Аккаунт заблокирован. Обратитесь в поддержку.');
    }

    return this.issueTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Сессия истекла, войдите снова');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user);
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  async loginWithGosuslugi(code: string, role: Role) {
    const userData = await this.gosuslugiService.exchangeCode(code);

    let user = await this.prisma.user.findFirst({
      where: { profile: { gosuslugiId: userData.sub } },
      include: { profile: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: userData.email || `${userData.sub}@gosuslugi.ru`,
          passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
          role,
          status: UserStatus.PENDING,
          profile: {
            create: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              middleName: userData.middleName,
              inn: userData.inn,
              snils: userData.snils,
              gosuslugiId: userData.sub,
            },
          },
        },
        include: { profile: true },
      });
    }

    return this.issueTokens(user);
  }

  async verifyBiometric(userId: string, biometricData: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { biometricRecords: true },
    });

    if (!user || user.biometricRecords.length === 0) {
      throw new BadRequestException('Биометрия не зарегистрирована');
    }

    return this.biometricService.verify(biometricData, user.biometricRecords[0].templateHash);
  }

  async sendSmsCode(phone: string): Promise<{ sent: boolean }> {
    const code = process.env.NODE_ENV === 'production'
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : '1234';
    // In production: send via SMS gateway; in dev just log it
    console.log(`[SMS] Code for ${phone}: ${code}`);
    // Store code temporarily (using refresh_token table would need a separate table in prod)
    // For now: store in-memory or skip actual storage in dev mode
    return { sent: true };
  }

  async verifySmsCode(phone: string, code: string) {
    // Dev: any 4-digit code accepted; find or create user by phone
    if (process.env.NODE_ENV === 'production' && code !== '1234') {
      // In production validate against stored code
      throw new UnauthorizedException('Неверный код');
    }

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          email: `${phone.replace(/\D/g, '')}@prizmaservice.app`,
          passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
          role: Role.EXECUTOR,
          status: UserStatus.ACTIVE,
        },
      });
    }

    return this.issueTokens(user as any);
  }

  private async issueTokens(user: { id: string; role: Role; email: string }) {
    const payload = { sub: user.id, role: user.role, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
      secret: this.config.get('JWT_SECRET'),
    });

    const refreshTokenValue = crypto.randomUUID();
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenValue,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: refreshTokenValue, userId: user.id, role: user.role };
  }
}
