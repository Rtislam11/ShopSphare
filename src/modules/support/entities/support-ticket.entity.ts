
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { SupportMessage } from './support-message.entity';

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SupportTicketCategory {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  PRODUCT = 'PRODUCT',
  ACCOUNT = 'ACCOUNT',
  OTHER = 'OTHER',
}

@Entity('support_tickets')
@Index(['userId', 'createdAt'])
@Index(['status', 'priority'])
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid', { name: 'ticket_id' })
  ticketId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo!: User | null;

  @Column({ length: 200 })
  subject!: string;

  @Column({
    type: 'enum',
    enum: SupportTicketCategory,
    default: SupportTicketCategory.OTHER,
  })
  category!: SupportTicketCategory;

  @Column({
    type: 'enum',
    enum: SupportTicketPriority,
    default: SupportTicketPriority.NORMAL,
  })
  priority!: SupportTicketPriority;

  @Column({
    type: 'enum',
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  status!: SupportTicketStatus;

  @OneToMany(() => SupportMessage, (message) => message.ticket)
  messages!: SupportMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
