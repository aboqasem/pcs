import {
  IntersectionType,
  NeverType,
  OmitType,
  PartialType,
  PickType,
} from '@aboqasem/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import {
  UserCurrentPassword,
  UserEmail,
  UserFullName,
  UserId,
  UserIsEmailVerified,
  UserPassword,
  UserPreferredName,
  UserSecret,
  UserUsername,
  UserUsernameOrEmail,
} from './mixins';

export class User extends IntersectionType(
  UserId,
  UserEmail,
  UserUsername,
  UserFullName,
  UserPreferredName,
  UserSecret,
  UserIsEmailVerified,
) {}

export class UserDto extends IntersectionType(OmitType(User, ['secret']), NeverType(UserSecret)) {}

export class CreateUserDto extends IntersectionType(
  PickType(UserDto, ['email', 'username', 'fullName', 'preferredName']),
  UserPassword,
) {}

export class CreatedUserDto extends PickType(UserDto, ['id']) {}

export class UpdateUserDto extends IntersectionType(
  PartialType(CreateUserDto),
  UserCurrentPassword,
) {}

export class UserCredentials extends IntersectionType(
  PickType(CreateUserDto, ['password']),
  UserUsernameOrEmail,
) {}

export class SignInUserDto extends UserCredentials {
  @IsBoolean()
  @IsOptional()
  rememberMe: boolean = false;
}

export class SignUpUserDto extends IntersectionType(CreateUserDto, SignInUserDto) {}
