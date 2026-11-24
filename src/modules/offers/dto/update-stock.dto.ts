
import {
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  adjustment?: number;
}
