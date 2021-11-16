import { StudentEnrollment, StudentEnrollmentStatus } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('student_enrollment')
export class StudentEnrollmentEntity extends StudentEnrollment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('enum', {
    enum: StudentEnrollmentStatus,
    enumName: 'student_enrollment_status',
    default: StudentEnrollmentStatus.Enrolled,
  })
  status = StudentEnrollmentStatus.Enrolled;

  /* JOINED RELATIONS */

  @Column('integer')
  studentId!: number;

  @ManyToOne(() => UserEntity, (user) => user.studentEnrollments)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  student?: UserEntity;

  @Column('integer')
  courseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.studentEnrollments)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'id' })
  course?: CourseEntity;
}
