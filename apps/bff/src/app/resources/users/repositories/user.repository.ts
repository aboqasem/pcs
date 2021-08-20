import { EntityRepository, FindConditions, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  usernameExists(username: string): Promise<boolean> {
    return this.count({ where: { username } }).then(Boolean);
  }

  emailExists(email: string): Promise<boolean> {
    return this.count({ where: { email } }).then(Boolean);
  }

  findByUsername(username: string): Promise<User | undefined> {
    return this.findOne({ where: { username } });
  }

  findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ where: { email } });
  }

  findByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const where: FindConditions<User> = usernameOrEmail.includes('@')
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail };

    return this.findOne({ where });
  }
}
