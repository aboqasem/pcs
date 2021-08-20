import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsRealName, IsUsername, IsUsernameOrEmail } from '../common';

export class UserId {
  @IsUUID()
  id!: string;
}

export class UserUsername {
  @IsUsername()
  username!: string;
}

export class UserEmail {
  @MaxLength(255)
  @IsEmail()
  email!: string;
}

export class UserUsernameOrEmail {
  @IsUsernameOrEmail()
  username!: string;
}

export class UserFullName {
  @IsRealName(5, 255)
  fullName!: string;
}

export class UserPreferredName {
  @IsRealName(1, 100)
  preferredName!: string;
}

export class UserPassword {
  @MinLength(8)
  @IsString()
  password!: string;
}

export class UserCurrentPassword {
  @MinLength(8)
  @IsString()
  currentPassword!: string;
}

export class UserSecret {
  @IsNotEmpty()
  secret!: string;
}

export class UserIsEmailVerified {
  @IsBoolean()
  @IsOptional()
  isEmailVerified: boolean = false;
}
