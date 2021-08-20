import { UserDto } from '@myplatform/shared-data-access';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from 'src/app/resources/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  override serializeUser(
    user: UserDto,
    done: (err: Error | null, id: UserDto['id']) => void,
  ): void {
    done(null, user.id);
  }

  override deserializeUser(
    id: UserDto['id'],
    done: (err: Error | null, user?: UserDto | null) => void,
  ): void {
    this.usersService
      .findById(id)
      .then((userDto) => done(null, userDto ?? null))
      .catch(done);
  }
}
