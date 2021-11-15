import { PartialType, PickType } from '@aboqasem/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CourseDto } from '../courses/courses.classes';
import { EnrolledStudentDto } from '../enrolled-students/enrolled-students.classes';
import { MaterialDto } from '../materials/materials.classes';
import { FilterDisabledConstraints } from '../validation/validation.decorators';
import {
  IsUserEmail,
  IsUserFullName,
  IsUserId,
  IsUserPassword,
  IsUserRole,
  IsUserUsername,
  IsUserUsernameOrEmail,
} from './users.decorators';
import { UserRole } from './users.types';

export class User {
  @IsUserId()
  id!: number;

  @IsUserEmail()
  email!: string;

  @IsUserUsername()
  username!: string;

  @IsUserFullName()
  fullName!: string;

  @IsUserRole()
  role!: UserRole;

  @IsBoolean()
  isActive = true;

  @IsUserPassword()
  password!: string;

  /* OTHER RELATIONS */

  @Type(() => CourseDto)
  @IsOptional()
  instructorCourses?: CourseDto[] | null;

  @Type(() => CourseDto)
  @IsOptional()
  instructorCreatedMaterials?: MaterialDto[] | null;

  @Type(() => EnrolledStudentDto)
  @IsOptional()
  enrolledStudents?: EnrolledStudentDto[] | null;
}

export class UserDto extends PickType(User, [
  'id',
  'email',
  'username',
  'fullName',
  'role',
  'isActive',
  'instructorCourses',
  'instructorCreatedMaterials',
  'enrolledStudents',
]) {}

export class CreateUserDto extends PickType(User, ['email', 'username', 'fullName', 'role']) {
  @IsUserPassword()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  password?: string;
}

export class CreateUsersDto {
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  @ArrayUnique((v) => v.username?.toLowerCase())
  @ArrayUnique((v) => v.email?.toLowerCase())
  // https://sendgrid.api-docs.io/v3.0/mail-send/mail-send-limitations
  @ArrayMaxSize(1000)
  @ArrayMinSize(1)
  @IsArray()
  users!: CreateUserDto[];
}

export class CreatedUserDto extends PickType(User, ['id']) {}

export class CreatedUsersDto {
  usersIds!: CreatedUserDto[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

@FilterDisabledConstraints()
export class UserCredentials extends PickType(User, ['password']) {
  @IsUserUsernameOrEmail()
  username!: string;
}
