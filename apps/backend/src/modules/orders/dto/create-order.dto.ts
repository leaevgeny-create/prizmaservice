import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { WorkType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  objectId: string;

  @ApiProperty({ enum: WorkType, isArray: true })
  @IsArray()
  @IsEnum(WorkType, { each: true })
  workTypes: WorkType[];

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  executorsNeeded: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({ description: 'ISO дата начала работ' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'ISO дата окончания работ' })
  @IsDateString()
  endDate: string;
}
