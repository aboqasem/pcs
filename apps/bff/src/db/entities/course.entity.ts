import { Course } from '@pcs/shared-data-access';
import { EnrolledStudentEntity } from 'src/db/entities/enrolled-student.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('course')
export class CourseEntity extends Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  title!: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @Column('timestamptz')
  beginsAt!: Date;

  @Column('timestamptz')
  endsAt!: Date;

  /* JOINED RELATIONS */

  @Column('integer')
  instructorId!: number;

  @ManyToOne(() => UserEntity, (user) => user.instructorCourses)
  @JoinColumn({ name: 'instructorId', referencedColumnName: 'id' })
  instructor?: UserEntity;

  /* OTHER RELATIONS */

  @OneToMany(() => MaterialEntity, (material) => material.createdForCourse, { nullable: true })
  materials?: MaterialEntity[] | null;

  @OneToMany(() => EnrolledStudentEntity, (enrolledStudent) => enrolledStudent.enrolledInCourse, {
    nullable: true,
  })
  enrolledStudents?: EnrolledStudentEntity[] | null;
}
