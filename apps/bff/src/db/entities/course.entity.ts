import { Course } from '@pcs/shared-data-access';
import { UserEntity } from 'src/db/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('course')
export class CourseEntity extends Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column('timestamptz')
  beginsAt!: Date;

  @Column('timestamptz')
  endsAt!: Date;

  /* JOINED RELATIONS */

  @Column({ type: 'integer' })
  instructorId!: number;

  @ManyToOne(() => UserEntity, (user) => user.instructorCourses)
  @JoinColumn({ name: 'instructorId', referencedColumnName: 'id' })
  instructor!: UserEntity;
}
