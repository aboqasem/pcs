import { PartialType, PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CourseDto } from '../courses/courses.classes';
import { IsCourseId } from '../courses/courses.decorators';
import { UserDto } from '../users/users.classes';
import { IsUserId } from '../users/users.decorators';
import { IsStudentEnrollmentId, IsStudentEnrollmentStatus } from './student-enrollments.decorators';
import { StudentEnrollmentStatus } from './student-enrollments.types';

export class StudentEnrollment {
  @IsStudentEnrollmentId()
  id!: number;

  @IsStudentEnrollmentStatus()
  status = StudentEnrollmentStatus.Enrolled;

  /* JOINED RELATIONS */

  @IsUserId()
  studentId!: number;

  @Type(() => UserDto)
  @IsOptional()
  student?: UserDto;

  @IsCourseId()
  courseId!: string;

  @Type(() => CourseDto)
  @IsOptional()
  course?: CourseDto;
}

export class StudentEnrollmentDto extends PickType(StudentEnrollment, [
  'id',
  'status',
  'studentId',
  'student',
  'courseId',
  'course',
]) {}

export class CreateStudentEnrollmentDto extends PickType(StudentEnrollment, ['studentId']) {}

export class CreatedStudentEnrollmentDto extends PickType(StudentEnrollment, ['id']) {}

export class UpdateStudentEnrollmentDto extends PartialType(CreateStudentEnrollmentDto) {}
