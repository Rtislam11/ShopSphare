import { IsEnum } from 'class-validator';
import { ProductStatus } from '../../products/entities/product.entity';

export class UpdateProductModerationDto {
  @IsEnum(ProductStatus)
  status!: ProductStatus;
}