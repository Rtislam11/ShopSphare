
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  orderAmount!: number;
}
