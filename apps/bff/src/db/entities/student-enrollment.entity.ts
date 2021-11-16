import { StudentEnrollment, EnrolledStudentStatus } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('student_enrollment')
export class StudentEnrollmentEntity extends StudentEnrollment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('enum', {
    enum: EnrolledStudentStatus,
    enumName: 'enrolled_student_status',
    default: EnrolledStudentStatus.Enrolled,
  })
  status = EnrolledStudentStatus.Enrolled;

  /* JOINED RELATIONS */

  @Column('integer')
  studentId!: number;

  @ManyToOne(() => UserEntity, (user) => user.studentEnrollments)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  student?: UserEntity;

  @Column('integer')
  enrolledInCourseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.studentEnrollments)
  @JoinColumn({ name: 'enrolledInCourseId', referencedColumnName: 'id' })
  enrolledInCourse?: CourseEntity;
}
