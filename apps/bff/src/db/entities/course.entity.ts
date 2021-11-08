import { Course } from '@pcs/shared-data-access';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { StudentEnrollmentEntity } from 'src/db/entities/student-enrollment.entity';
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

  @OneToMany(
    () => StudentEnrollmentEntity,
    (studentEnrollment) => studentEnrollment.enrolledInCourse,
    {
      nullable: true,
    },
  )
  studentEnrollments?: StudentEnrollmentEntity[] | null;
}
