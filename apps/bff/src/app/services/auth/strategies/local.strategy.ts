import { UserDto } from '@myplatform/shared-data-access';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/app/resources/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(username: string, password: string): Promise<UserDto> {
    const user = await this.usersService.findByCredentials({
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
