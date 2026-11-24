
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { Wishlist } from './wishlist.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('wishlist_items')
@Unique(['wishlist', 'product'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid', { name: 'wishlist_item_id' })
  wishlistItemId!: string;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist!: Wishlist;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @CreateDateColumn({ name: 'added_at' })
  addedAt!: Date;
}
