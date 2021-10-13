import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  override serializeUser(
    user: Express.User,
    done: (err: Error | null, id: Express.User['id']) => void,
  ): void {
    done(null, user.id);
  }

  override deserializeUser(
    id: Express.User['id'],
    done: (err: Error | null, user?: Express.User | null) => void,
  ): void {
    this.usersService
      .getActiveUserById(id)
      .then((userDto) => done(null, userDto ?? null))
      .catch(done);
  }
}
