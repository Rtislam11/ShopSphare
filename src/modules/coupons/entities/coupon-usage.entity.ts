
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('coupon_usages')
@Index(['couponId', 'userId'])
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid', { name: 'usage_id' })
  usageId!: string;

  @Column({ name: 'coupon_id', type: 'uuid' })
  couponId!: string;

  @ManyToOne(() => Coupon, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @CreateDateColumn({ name: 'used_at' })
  usedAt!: Date;
}
