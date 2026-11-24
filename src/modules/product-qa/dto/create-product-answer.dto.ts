
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(5000)
  answer!: string;
}
