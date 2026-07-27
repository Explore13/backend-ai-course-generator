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
import { CourseList } from '../course-list/course-list.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, type: 'varchar' })
  course_id!: string;

  @ManyToOne(() => CourseList, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'course_id' })
  course!: CourseList;

  @Column({ nullable: false, type: 'varchar' })
  chapter_id!: string;

  @Column({ nullable: false, type: 'jsonb' })
  content!: any;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  video_id!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  deletedAt!: Date | null;
}
