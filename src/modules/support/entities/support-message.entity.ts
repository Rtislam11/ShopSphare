
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { SupportTicket } from './support-ticket.entity';

@Entity('support_messages')
@Index(['ticketId', 'createdAt'])
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid', { name: 'message_id' })
  messageId!: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: SupportTicket;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    name: 'attachment_url',
    type: 'text',
    nullable: true,
  })
  attachmentUrl!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
