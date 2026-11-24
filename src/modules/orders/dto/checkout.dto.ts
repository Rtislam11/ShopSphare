
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  shippingAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;
}
