import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ivan@company.ru' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: '+79001234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
  password: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'Некорректная роль' })
  role: Role;

  @ApiProperty({ example: 'Иван' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Иванович', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;
}
