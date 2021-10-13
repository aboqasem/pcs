import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserDto } from '@pcs/shared-data-access';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(username: string, password: string): Promise<UserDto> {
    const user = await this.usersService.getActiveUserByCredentials({
      username,
      password,
    });

    if (!user) {
      throw new UnauthorizedException(
        `Invalid ${username.includes('@') ? 'email' : 'username'} or password`,
      );
    }

    return user;
  }
}
