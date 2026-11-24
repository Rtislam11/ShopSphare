
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ProductQuestion } from './product-question.entity';

@Entity('product_answers')
@Index(['questionId', 'createdAt'])
export class ProductAnswer {
  @PrimaryGeneratedColumn('uuid', { name: 'answer_id' })
  answerId!: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @ManyToOne(() => ProductQuestion, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question!: ProductQuestion;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text' })
  answer!: string;

  @Column({ name: 'helpful_count', type: 'integer', default: 0 })
  helpfulCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
