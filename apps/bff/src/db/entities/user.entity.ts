import { UserRole, UserType } from '@pcs/shared-data-access';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends UserType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true, collation: 'case_insensitive' })
  email!: string;

  @Column({ type: 'text', unique: true, collation: 'case_insensitive' })
  username!: string;

  @Column('text')
  fullName!: string;

  @Index()
  @Column('enum', { enum: UserRole })
  role!: UserRole;

  @Column('bool', { default: true })
  isActive = true;

  @Column('text')
  password!: string;
}
