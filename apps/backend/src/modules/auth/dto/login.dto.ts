import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ivan@company.ru' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
