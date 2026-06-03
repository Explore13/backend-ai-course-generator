import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: false, type: 'uuid' })
  clerk_id!: string;

  @Column({ nullable: true, type: 'string' })
  first_name!: string;

  @Column({ nullable: true, type: 'string' })
  last_name!: string;

  @Column({ nullable: true, type: 'string' })
  image_url!: string;

  @Column({ nullable: true, type: 'string' })
  email!: string;

  @Column({ nullable: true, type: 'string' })
  phone_number!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  deletedAt!: Date | null;
}
