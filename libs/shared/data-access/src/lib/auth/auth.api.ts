import { IsBoolean } from 'class-validator';
import { UserCredentials, UserDto } from '../users/users.classes';
import { IsUserEmail } from '../users/users.decorators';

export class AuthSignInBody extends UserCredentials {
  @IsBoolean()
  rememberMe = false;
}
export type TAuthSignInData = UserDto;

export type TAuthSignOutData = true;

export class AuthRetrievePasswordBody {
  @IsUserEmail()
  email!: string;
}
export type TAuthRetrievePasswordData = true;
