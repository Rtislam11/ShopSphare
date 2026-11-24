
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    select: false,
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'CUSTOMER',
  })
  role!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
  })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
