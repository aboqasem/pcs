import { OmitType, PartialType, PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { FilterByValidateIfFn } from '../shared/shared.decorators';
import {
  IsPassword,
  IsUserEmail,
  IsUserFullName,
  IsUserId,
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

  @IsPassword()
  password!: string;
}

export class UserDto extends OmitType(User, ['password']) {}

export class CreateUserDto extends OmitType(User, ['id', 'isActive', 'password']) {
  @IsPassword()
  @IsOptional()
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

@FilterByValidateIfFn()
export class UserCredentials extends PickType(User, ['password']) {
  @IsUserUsernameOrEmail()
  username!: string;
}

export class SignInDto extends UserCredentials {
  @IsBoolean()
  rememberMe = false;
}

export class RetrievePasswordDto {
  @IsUserEmail()
  email!: string;
}
