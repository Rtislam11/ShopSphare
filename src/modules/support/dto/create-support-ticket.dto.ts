
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  SupportTicketCategory,
  SupportTicketPriority,
} from '../entities/support-ticket.entity';

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @IsOptional()
  @IsEnum(SupportTicketCategory)
  category?: SupportTicketCategory;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
