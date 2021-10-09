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

export class UserType {
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

export class UserDto extends OmitType(UserType, ['password']) {}

export class CreateUserDto extends OmitType(UserType, ['id', 'isActive', 'password']) {
  @IsPassword()
  @IsOptional()
  password?: string;
}

export class CreateUsersDto {
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  @ArrayUnique((v) => v.username?.toLowerCase())
  @ArrayUnique((v) => v.email?.toLowerCase())
  @ArrayMaxSize(1000 /* https://sendgrid.api-docs.io/v3.0/mail-send/mail-send-limitations */)
  @ArrayMinSize(1)
  @IsArray()
  users!: CreateUserDto[];
}

export class CreatedUsersDto {
  users!: CreatedUserDto[];
}

export class CreatedUserDto extends PickType(UserType, ['id']) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

@FilterByValidateIfFn()
export class UserCredentials extends PickType(UserType, ['password']) {
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
