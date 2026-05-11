import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitRatingDto {
  @ApiProperty({ description: 'Субъективная оценка заказчика 0-10', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  customerScore: number;
}
