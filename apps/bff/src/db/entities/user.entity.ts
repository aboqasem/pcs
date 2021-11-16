import { User, UserRole } from '@pcs/shared-data-access';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { StudentEnrollmentEntity } from 'src/db/entities/student-enrollment.entity';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity('user')
export class UserEntity extends User {
  @PrimaryGeneratedColumn('increment')
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

  @Column('text', { select: false })
  // not selected by default
  password?: string;

  /* OTHER RELATIONS */

  @OneToMany(() => CourseEntity, (course) => course.instructor, { nullable: true })
  instructorCourses?: CourseEntity[] | null;

  @OneToMany(() => MaterialEntity, (material) => material.creatorInstructor, { nullable: true })
  instructorCreatedMaterials?: MaterialEntity[] | null;

  @OneToMany(() => StudentEnrollmentEntity, (studentEnrollment) => studentEnrollment.student, {
    nullable: true,
  })
  studentEnrollments?: StudentEnrollmentEntity[] | null;
}
