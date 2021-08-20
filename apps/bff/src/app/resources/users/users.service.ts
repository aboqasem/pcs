import {
  CreatedUserDto,
  CreateUserDto,
  UserCredentials,
  UserDto,
  userToDto,
} from '@myplatform/shared-data-access';
import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findOne({ id });
    return user && userToDto(user);
  }

  async findByCredentials(credentials: UserCredentials): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findByUsernameOrEmail(credentials.username);

    if (user?.secret && bcrypt.compareSync(credentials.password, user.secret)) {
      return userToDto(user);
    }

    return undefined;
  }

  async userIsUnique(dto: CreateUserDto): Promise<void> {
    const errors = (
      await Promise.all([
        this.usersRepository
          .usernameExists(dto.username)
          .then((exists) => exists && new Error('username has already been taken')),
        this.usersRepository
          .emailExists(dto.email)
          .then((exists) => exists && new Error('email has already been taken')),
      ])
    ).filter(Boolean) as Error[];

    if (errors.length) {
      throw errors;
    }
  }

  async createUser(dto: CreateUserDto): Promise<CreatedUserDto> {
    await this.userIsUnique(dto);

    const newUser = this.usersRepository.create({
      ...dto,
      secret: bcrypt.hashSync(dto.password, 10),
    });

    return this.usersRepository.insert(newUser).then(({ identifiers: [{ id }] }) => ({
      id: id as CreatedUserDto['id'],
    }));
  }
}
