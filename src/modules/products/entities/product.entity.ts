
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
import { Category } from '../../categories/entities/category.entity';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Seller, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'sellerId' })
  seller!: Seller;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category!: Category;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status_enum',
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
