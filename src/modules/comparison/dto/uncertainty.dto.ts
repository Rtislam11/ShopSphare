import {
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class UncertaintyDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priceUncertainty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reliabilityUncertainty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountUncertainty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  stockUncertainty?: number;
}