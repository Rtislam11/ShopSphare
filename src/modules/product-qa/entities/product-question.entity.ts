
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

import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductAnswer } from './product-answer.entity';

export enum ProductQuestionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('product_questions')
@Index(['productId', 'status', 'createdAt'])
@Index(['userId', 'createdAt'])
export class ProductQuestion {
  @PrimaryGeneratedColumn('uuid', { name: 'question_id' })
  questionId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text' })
  question!: string;

  @Column({
    type: 'enum',
    enum: ProductQuestionStatus,
    default: ProductQuestionStatus.PENDING,
  })
  status!: ProductQuestionStatus;
  @Column({
  name: 'moderation_note',
  type: 'varchar',
  length: 500,
  nullable: true,
})
moderationNote!: string | null;
  @OneToMany(() => ProductAnswer, (answer) => answer.question)
  answers!: ProductAnswer[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
