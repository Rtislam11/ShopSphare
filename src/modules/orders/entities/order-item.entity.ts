import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { Seller } from '../../sellers/entities/seller.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid', { name: 'order_item_id' })
  orderItemId!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'orderId' })
  order!: Order;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Seller, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'sellerId' })
  seller!: Seller;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}