
import {
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class AddWishlistItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId!: string;
}
