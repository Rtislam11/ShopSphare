
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReturnItemDto {
  @IsUUID()
  orderItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateReturnDto {
  @IsUUID()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items!: ReturnItemDto[];
}
