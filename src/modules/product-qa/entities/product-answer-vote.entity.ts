
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ProductAnswer } from './product-answer.entity';

@Entity('product_answer_votes')
@Unique(['answerId', 'userId'])
@Index(['answerId'])
export class ProductAnswerVote {
  @PrimaryGeneratedColumn('uuid', { name: 'vote_id' })
  voteId!: string;

  @Column({ name: 'answer_id', type: 'uuid' })
  answerId!: string;

  @ManyToOne(() => ProductAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer!: ProductAnswer;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
