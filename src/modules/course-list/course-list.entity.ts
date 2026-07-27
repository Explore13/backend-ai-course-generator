import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('course_lists')
export class CourseList {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: false, type: 'varchar' })
  course_id!: string;

  @Column({ nullable: false, type: 'varchar' })
  name!: string;

  @Column({ nullable: false, type: 'varchar' })
  category!: string;

  @Column({ nullable: false, type: 'varchar' })
  level!: string;

  @Column({ nullable: false, type: 'varchar', default: 'Yes' })
  include_video!: string;

  @Column({ nullable: false, type: 'jsonb' })
  course_output!: any;

  @Column({ nullable: false, type: 'varchar' })
  clerk_id!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'clerk_id', referencedColumnName: 'clerk_id' })
  user!: User;

  @Column({ nullable: true, type: 'varchar', default: '/placeholder.png' })
  course_banner!: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  publish!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  deletedAt!: Date | null;
}
