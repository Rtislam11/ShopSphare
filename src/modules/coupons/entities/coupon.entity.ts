
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid', { name: 'coupon_id' })
  couponId!: string;

  @Index({ unique: true })
  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: CouponDiscountType,
  })
  discountType!: CouponDiscountType;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  discountValue!: number;

  @Column({
    name: 'minimum_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  minimumOrderAmount!: number;

  @Column({
    name: 'maximum_discount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maximumDiscount!: number | null;

  @Column({ name: 'usage_limit', type: 'integer', nullable: true })
  usageLimit!: number | null;

  @Column({
    name: 'usage_count',
    type: 'integer',
    default: 0,
  })
  usageCount!: number;

  @Column({
    name: 'per_user_limit',
    type: 'integer',
    default: 1,
  })
  perUserLimit!: number;

  @Column({ name: 'starts_at', type: 'timestamp' })
  startsAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
