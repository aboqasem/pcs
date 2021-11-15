import { OmitType, PartialType, PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CourseDto } from '../courses/courses.classes';
import { IsCourseId } from '../courses/courses.decorators';
import { UserDto } from '../users/users.classes';
import { IsUserId } from '../users/users.decorators';
import {
  IsMaterialBeginsAt,
  IsMaterialDescription,
  IsMaterialEndsAt,
  IsMaterialId,
  IsMaterialStatus,
  IsMaterialTitle,
  IsMaterialTotalDuration,
  IsMaterialTotalMark,
  IsMaterialType,
} from './materials.decorators';
import { MaterialStatus, MaterialType } from './materials.types';

export class Material {
  @IsMaterialId()
  id!: string;

  @IsMaterialTitle()
  title!: string;

  @IsMaterialDescription()
  description?: string | null;

  @IsMaterialType()
  type!: MaterialType;

  @IsMaterialBeginsAt()
  beginsAt!: Date;

  @IsMaterialEndsAt()
  endsAt?: Date | null;

  @IsMaterialStatus()
  status = MaterialStatus.Draft;

  @IsMaterialTotalMark()
  totalMark!: number;

  @IsMaterialTotalDuration()
  totalDuration?: number | null;

  /* JOINED RELATIONS */

  @IsCourseId()
  createdForCourseId!: string;

  @Type(() => CourseDto)
  @IsOptional()
  createdForCourse?: CourseDto;

  @IsUserId()
  creatorInstructorId!: number;

  @Type(() => UserDto)
  @IsOptional()
  creatorInstructor?: UserDto;
}

export class MaterialDto extends PickType(Material, [
  'id',
  'title',
  'description',
  'type',
  'beginsAt',
  'endsAt',
  'status',
  'totalMark',
  'totalDuration',
  'createdForCourseId',
  'createdForCourse',
  'creatorInstructorId',
  'creatorInstructor',
]) {}

export class CreateMaterialDto extends PickType(Material, [
  'title',
  'description',
  'type',
  'beginsAt',
  'endsAt',
  'totalMark',
  'totalDuration',
]) {}

export class CreatedMaterialDto extends PickType(Material, ['id']) {}

export class UpdateMaterialDto extends PartialType(OmitType(CreateMaterialDto, ['type'])) {}
