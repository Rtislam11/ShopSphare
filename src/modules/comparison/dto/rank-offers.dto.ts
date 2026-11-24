import {
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class RankOffersDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priceWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reliabilityWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  stockWeight?: number;
}