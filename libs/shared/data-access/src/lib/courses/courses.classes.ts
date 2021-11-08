import { PartialType, PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { UserDto } from '../users/users.classes';
import { IsUserId } from '../users/users.decorators';
import {
  IsCourseBeginsAt,
  IsCourseDescription,
  IsCourseEndsAt,
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

  @IsCourseBeginsAt()
  beginsAt!: Date;

  @IsCourseEndsAt()
  endsAt!: Date;

  @IsUserId()
  instructorId!: number;

  @Type(() => UserDto)
  @IsOptional()
  instructor?: UserDto;
}

export class CourseDto extends PickType(Course, [
  'id',
  'title',
  'description',
  'beginsAt',
  'endsAt',
  'instructorId',
]) {}

export class CreateCourseDto extends PickType(Course, [
  'title',
  'description',
  'beginsAt',
  'endsAt',
]) {}

export class CreatedCourseDto extends PickType(Course, ['id']) {}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
