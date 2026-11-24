
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateShipmentDto {
  @IsUUID()
  orderId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shippingProvider!: string;

  @IsNotEmpty()
  @IsString()
  shippingAddress!: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;
}
