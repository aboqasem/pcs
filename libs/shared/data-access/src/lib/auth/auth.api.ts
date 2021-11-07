import { IsBoolean } from 'class-validator';
import { UserCredentials, UserDto } from '../users/users.classes';
import { IsUserEmail } from '../users/users.decorators';

export class AuthSignInBody extends UserCredentials {
  @IsBoolean()
  rememberMe = false;
}
export type AuthSignInData = UserDto;

export type AuthSignOutData = true;

export class AuthRetrievePasswordBody {
  @IsUserEmail()
  email!: string;
}
export type AuthRetrievePasswordData = true;
