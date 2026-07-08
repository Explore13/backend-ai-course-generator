import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: false, type: 'varchar' })
  clerk_id!: string;

  @Column({ nullable: true, type: 'varchar' })
  first_name!: string;

  @Column({ nullable: true, type: 'varchar' })
  last_name!: string;

  @Column({ nullable: true, type: 'varchar' })
  image_url!: string;

  @Column({ nullable: true, type: 'varchar' })
  email!: string;

  @Column({ nullable: true, type: 'varchar' })
  phone_number!: string;

  @Column({ type: 'enum', enum: Role, nullable: false, default: Role.User })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  deletedAt!: Date | null;
}
