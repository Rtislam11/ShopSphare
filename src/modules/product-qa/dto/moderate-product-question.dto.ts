
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ProductQuestionStatus } from '../entities/product-question.entity';

export class ModerateProductQuestionDto {
  @IsEnum(ProductQuestionStatus)
  status!: ProductQuestionStatus;
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderationNote?: string;
}

