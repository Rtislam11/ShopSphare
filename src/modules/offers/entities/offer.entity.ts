
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Seller } from '../../sellers/entities/seller.entity';
import { Product } from '../../products/entities/product.entity';

export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid', { name: 'offer_id' })
  offerId!: string;

  @ManyToOne(() => Seller, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'sellerId' })
  seller!: Seller;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2 })
  discountPercentage!: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate!: Date;

  @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  stockQuantity!: number;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    enumName: 'offer_status_enum',
    default: OfferStatus.ACTIVE,
  })
  status!: OfferStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
