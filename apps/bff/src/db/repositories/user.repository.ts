import { EntityRepository, FindConditions, FindOneOptions, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
  findByUsernameOrEmail(
    usernameOrEmail: string,
    conditions?: Omit<FindConditions<UserEntity>, 'email' | 'username'>,
    options?: FindOneOptions<UserEntity>,
  ): Promise<UserEntity | undefined> {
    return this.findOne(
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail, ...conditions }
        : { username: usernameOrEmail, ...conditions },
      options,
    );
  }
}
