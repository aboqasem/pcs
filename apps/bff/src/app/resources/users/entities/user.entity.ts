import { User as UserType } from '@myplatform/shared-data-access';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends UserType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'citext', unique: true })
  username!: string;

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Column()
  secret!: string;

  @Column({ length: 255 })
  fullName!: string;

  @Column({ length: 100 })
  preferredName!: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified = false;
}
