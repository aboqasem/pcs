import { EntityRepository, FindOneOptions, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  existsByUsername(username: string): Promise<boolean> {
    return this.count({ where: { username } }).then(Boolean);
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.count({ where: { email } }).then(Boolean);
  }

  findByUsernameOrEmail(
    usernameOrEmail: string,
    options?: Omit<FindOneOptions<User>, 'where'>,
  ): Promise<User | undefined> {
    return this.findOne({
      where: usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
      ...options,
    });
  }
}
