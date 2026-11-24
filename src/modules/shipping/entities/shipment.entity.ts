
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid', { name: 'shipment_id' })
  shipmentId!: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId!: string;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  trackingNumber!: string;

  @Column({
    name: 'shipping_provider',
    type: 'varchar',
    length: 100,
  })
  shippingProvider!: string;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress!: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status!: ShipmentStatus;

  @Column({
    name: 'estimated_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  estimatedDeliveryDate!: Date | null;

  @Column({
    name: 'delivered_at',
    type: 'timestamp',
    nullable: true,
  })
  deliveredAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
