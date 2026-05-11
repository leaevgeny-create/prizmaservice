import { Body, Controller, Post, UseGuards, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Вход в систему' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Обновление токена доступа' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  logout(@CurrentUser('id') userId: string, @Body('refreshToken') refreshToken: string) {
    return this.authService.logout(userId, refreshToken);
  }

  @Post('sms/send')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отправить SMS-код на телефон' })
  sendSmsCode(@Body('phone') phone: string) {
    return this.authService.sendSmsCode(phone);
  }

  @Post('sms/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Подтвердить SMS-код' })
  verifySmsCode(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.verifySmsCode(phone, code);
  }

  @Post('gosuslugi/callback')
  @ApiOperation({ summary: 'Вход через Госуслуги (ЕСИА)' })
  gosuslugiCallback(@Body('code') code: string, @Body('role') role: any) {
    return this.authService.loginWithGosuslugi(code, role);
  }

  @Post('biometric/verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Биометрическая верификация' })
  verifyBiometric(
    @CurrentUser('id') userId: string,
    @Body('biometricData') biometricData: string,
  ) {
    return this.authService.verifyBiometric(userId, biometricData);
  }
}
