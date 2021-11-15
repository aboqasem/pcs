import { PartialType, PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CourseDto } from '../courses/courses.classes';
import { IsCourseId } from '../courses/courses.decorators';
import { UserDto } from '../users/users.classes';
import { IsUserId } from '../users/users.decorators';
import { IsEnrolledStudentId, IsEnrolledStudentStatus } from './enrolled-students.decorators';
import { EnrolledStudentStatus } from './enrolled-students.types';

export class EnrolledStudent {
  @IsEnrolledStudentId()
  id!: number;

  @IsEnrolledStudentStatus()
  status = EnrolledStudentStatus.Enrolled;

  /* JOINED RELATIONS */

  @IsUserId()
  studentId!: number;

  @Type(() => UserDto)
  student!: UserDto;

  @IsCourseId()
  enrolledInCourseId!: string;

  @Type(() => CourseDto)
  @IsOptional()
  enrolledInCourse?: CourseDto;
}

export class EnrolledStudentDto extends PickType(EnrolledStudent, [
  'id',
  'status',
  'studentId',
  'student',
  'enrolledInCourseId',
  'enrolledInCourse',
]) {}

export class CreateEnrolledStudentDto extends PickType(EnrolledStudent, [
  'id',
  'studentId',
  'enrolledInCourse',
]) {}

export class CreatedEnrolledStudentDto extends PickType(EnrolledStudent, ['id']) {}

export class UpdateEnrolledStudentDto extends PartialType(CreateEnrolledStudentDto) {}
