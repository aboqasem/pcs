import { EnrolledStudent, EnrolledStudentStatus } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('enrolled_student')
export class EnrolledStudentEntity extends EnrolledStudent {
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

  @ManyToOne(() => UserEntity, (user) => user.enrolledStudents)
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  student!: UserEntity;

  @Column('integer')
  enrolledInCourseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.enrolledStudents)
  @JoinColumn({ name: 'enrolledInCourseId', referencedColumnName: 'id' })
  enrolledInCourse?: CourseEntity;
}
