import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum SellerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn('uuid', { name: 'seller_id' })
  sellerId!: string;

  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;

  @Column({ name: 'business_name', type: 'varchar', length: 150 })
  businessName!: string;

  @Column({ name: 'business_description', type: 'text', nullable: true })
  businessDescription!: string | null;

  @Column({ name: 'business_email', type: 'varchar', length: 150 })
  businessEmail!: string;

  @Column({ name: 'business_phone', type: 'varchar', length: 20 })
  businessPhone!: string;

  @Column({ name: 'business_address', type: 'text' })
  businessAddress!: string;

  @Column({
    type: 'enum',
    enum: SellerStatus,
    default: SellerStatus.PENDING,
  })
  status!: SellerStatus;

  @Column({
    name: 'reliability_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  reliabilityScore!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}