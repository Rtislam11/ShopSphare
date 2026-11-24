
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { SupportTicketStatus } from '../entities/support-ticket.entity';

export class UpdateSupportTicketStatusDto {
  @IsEnum(SupportTicketStatus)
  status!: SupportTicketStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
