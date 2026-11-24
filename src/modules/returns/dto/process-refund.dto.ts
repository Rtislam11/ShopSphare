
import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessRefundDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  refundAmount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
