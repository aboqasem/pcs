import { Injectable, Logger } from '@nestjs/common';
import {
  CreatedUserDto,
  CreatedUsersDto,
  CreateUserDto,
  CreateUsersDto,
  TPropsErrors,
  UserCredentials,
  UserDto,
  UserRole,
  userToDto,
  UserType,
  validateSync,
  ValidationException,
} from '@pcs/shared-data-access';
import { plainToClass } from 'class-transformer';
import { config } from 'src/config/config';
import { UsersRepository } from 'src/db/repositories/user.repository';
import { EmailType } from 'src/modules/email/email.types';
import { generateRandomPassword } from 'src/shared/shared.utils';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async findById(id: number): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findOne({ id });
    return user && userToDto(user);
  }

  async findPasswordByEmail(
    email: string,
  ): Promise<Pick<UserType, 'fullName' | 'password'> | undefined> {
    return this.usersRepository.findOne({ email }, { select: ['fullName', 'password'] });
  }

  async findByCredentials(credentials: UserCredentials): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findByUsernameOrEmail(credentials.username);

    if (user?.password === credentials.password) {
      return userToDto(user);
    }

    return undefined;
  }

  async usersAreUnique({ users }: CreateUsersDto): Promise<void> {
    const usersErrors: TPropsErrors<CreateUsersDto> = {};
    const ERROR_MSG = 'Has already been taken';

    await Promise.all(
      users.map(async (dto, i) => {
        const [username, email] = await Promise.all([
          this.usersRepository
            .existsByUsername(dto.username)
            .then((exists) => (exists ? ERROR_MSG : undefined)),
          this.usersRepository
            .existsByEmail(dto.email)
            .then((exists) => (exists ? ERROR_MSG : undefined)),
        ]);

        if (username || email) {
          usersErrors[`users.${i}.username` as any] = { message: username };
          usersErrors[`users.${i}.email` as any] = { message: email };

          throw new ValidationException(usersErrors);
        }
      }),
    );
  }

  async createUsers(dto: CreateUsersDto): Promise<CreatedUsersDto> {
    await this.usersAreUnique(dto);

    const users = dto.users.map((user) =>
      this.usersRepository.create({
        ...user,
        password: user.password || generateRandomPassword(),
      }),
    );

    return {
      users: await this.usersRepository
        .insert(users)
        // after success, send emails to the added users
        .then((insertions) => {
          this.emailService.send(
            ...users.map(({ email, username, fullName, password, role }) => ({
              to: email,
              type: EmailType.NewUser,
              data: {
                fullName,
                username,
                password,
                role,
                signInUrl: config.APP_SIGN_IN_URL,
              },
            })),
          );

          return insertions;
        })
        .then(({ identifiers }) =>
          identifiers.map(({ id }) => ({ id: id as CreatedUserDto['id'] })),
        ),
    };
  }

  async createAdminIfNotExists(): Promise<void> {
    if (await this.usersRepository.count({ where: { role: UserRole.Admin } })) {
      return;
    }

    this.logger.log('No admin user exists, creating one...');

    const {
      ADMIN_EMAIL: email,
      ADMIN_USERNAME: username,
      ADMIN_FULL_NAME: fullName,
      ADMIN_PASSWORD: password,
    } = process.env;
    const user = this.usersRepository.create({
      email,
      username,
      fullName,
      password,
      role: UserRole.Admin,
    });

    const errors = validateSync(plainToClass(CreateUserDto, user));

    if (errors.length) {
      throw new ValidationException(errors);
    }

    await this.createUsers({ users: [user] });

    this.logger.log('Admin user created.');
  }
}
