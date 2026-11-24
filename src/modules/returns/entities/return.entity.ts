
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
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { ReturnItem } from './return-item.entity';

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  RECEIVED = 'RECEIVED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum RefundStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('returns')
@Index(['userId', 'createdAt'])
export class Return {
  @PrimaryGeneratedColumn('uuid', { name: 'return_id' })
  returnId!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.REQUESTED,
  })
  status!: ReturnStatus;

  @Column({
    name: 'refund_status',
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.NOT_APPLICABLE,
  })
  refundStatus!: RefundStatus;

  @Column({ name: 'reason', type: 'text' })
  reason!: string;

  @Column({ name: 'admin_note', type: 'text', nullable: true })
  adminNote!: string | null;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  refundAmount!: number;

  @OneToMany(() => ReturnItem, (item) => item.return, {
    cascade: true,
  })
  items!: ReturnItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
