
import { IsUUID } from 'class-validator';

export class AssignSupportTicketDto {
  @IsUUID()
  assignedToId!: string;
}
