
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Return } from './return.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn('uuid', { name: 'return_item_id' })
  returnItemId!: string;

  @Column({ name: 'return_id', type: 'uuid' })
  returnId!: string;

  @ManyToOne(() => Return, (returnRequest) => returnRequest.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'return_id' })
  return!: Return;

  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId!: string;

  @ManyToOne(() => OrderItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem!: OrderItem;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  refundAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
