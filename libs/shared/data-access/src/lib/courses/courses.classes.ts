import { PartialType, PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { UserDto } from '../users/users.classes';
import { IsUserId } from '../users/users.decorators';
import {
  IsCourseBeginDate,
  IsCourseDescription,
  IsCourseEndDate,
  IsCourseId,
  IsCourseTitle,
} from './courses.decorators';

export class Course {
  @IsCourseId()
  id!: string;

  @IsCourseTitle()
  title!: string;

  @IsCourseDescription()
  description?: string | null;

  @IsCourseBeginDate()
  beginDate!: Date;

  @IsCourseEndDate()
  endDate!: Date;

  @IsUserId()
  instructorId!: number;

  @Type(() => UserDto)
  instructor!: UserDto;
}

export class CourseDto extends PickType(Course, [
  'id',
  'title',
  'description',
  'beginDate',
  'endDate',
  'instructorId',
]) {}

export class CreateCourseDto extends PickType(Course, [
  'title',
  'description',
  'beginDate',
  'endDate',
]) {}

export class CreatedCourseDto extends PickType(Course, ['id']) {}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
