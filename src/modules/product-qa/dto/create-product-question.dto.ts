
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  question!: string;
}
