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
  userToUserDto,
  validateSync,
  ValidationError,
} from '@pcs/shared-data-access';
import { plainToClass } from 'class-transformer';
import { config } from 'src/config/config';
import { UserEntity } from 'src/db/entities/user.entity';
import { UsersRepository } from 'src/db/repositories/user.repository';
import { EmailType } from 'src/modules/email/email.types';
import { BadPayloadException } from 'src/shared/exceptions/bad-payload.exception';
import { generateRandomPassword } from 'src/shared/shared.utils';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async getUsers(select?: (keyof UserEntity)[], relations?: string[]): Promise<UserDto[]> {
    return this.usersRepository.find({ select, relations });
  }

  async getActiveUserById(
    id: number,
    select?: (keyof UserEntity)[],
    relations?: (keyof UserEntity)[],
  ): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne({ id, isActive: true }, { select, relations });
  }

  async getActiveUserByEmail(
    email: string,
    select?: (keyof UserEntity)[],
    relations?: (keyof UserEntity)[],
  ): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne({ email, isActive: true }, { select, relations });
  }

  async getActiveUserByCredentials(
    credentials: UserCredentials,
    select?: (keyof UserEntity)[],
    relations?: (keyof UserEntity)[],
  ): Promise<UserEntity | undefined> {
    select = select ?? ['id', 'email', 'username', 'fullName', 'role', 'isActive'];

    const user = await this.usersRepository.findByUsernameOrEmail(
      credentials.username,
      {
        isActive: true,
      },
      // because we want the password for comparison, we have to select all those fields in UserDto as well as password
      // since the password not selected by default
      { select: [...select, 'password'], relations },
    );

    if (user?.password === credentials.password) {
      if (select.includes('password')) {
        return user;
      }
      return userToUserDto(user);
    }

    return undefined;
  }

  async usersAreUnique({ users }: CreateUsersDto): Promise<void> {
    const usersErrors: TPropsErrors = {};
    const ERROR_MSG = 'Has already been taken';

    await Promise.all(
      users.map(async ({ username, email }, i) => {
        const [usernameError, emailError] = await Promise.all([
          this.usersRepository.count({ username }).then((count) => (count ? ERROR_MSG : undefined)),
          this.usersRepository.count({ email }).then((count) => (count ? ERROR_MSG : undefined)),
        ]);

        if (usernameError || emailError) {
          usernameError && (usersErrors[`users.${i}.username`] = { message: usernameError });
          emailError && (usersErrors[`users.${i}.email`] = { message: emailError });

          throw new BadPayloadException(usersErrors);
        }
      }),
    );
  }

  async createAndInformUsers(dto: CreateUsersDto): Promise<CreatedUsersDto> {
    await this.usersAreUnique(dto);

    const users = dto.users.map((user) =>
      this.usersRepository.create({
        ...user,
        password: user.password || generateRandomPassword(),
      }),
    );

    const insertedUsersIds = await this.usersRepository.insert(users).then((insertions) => {
      return insertions.identifiers.map(({ id }) => ({ id: id as CreatedUserDto['id'] }));
    });

    const emails = users.map((user) => ({
      to: user.email,
      type: EmailType.NewUser,
      data: {
        fullName: user.fullName,
        username: user.username,
        password: user.password!,
        role: user.role,
        signInUrl: config.APP_SIGN_IN_URL,
      },
    }));
    this.emailService.send(...emails);

    return { usersIds: insertedUsersIds };
  }

  async createAndInformAdminIfNotExists(): Promise<void> {
    if (await this.usersRepository.count({ where: { role: UserRole.Admin, isActive: true } })) {
      return;
    }
    this.logger.log('No admin user exists, creating one...');

    const user = this.usersRepository.create({
      email: process.env.ADMIN_EMAIL,
      username: process.env.ADMIN_USERNAME,
      fullName: process.env.ADMIN_FULL_NAME,
      password: process.env.ADMIN_PASSWORD,
      role: UserRole.Admin,
    });

    const errors = validateSync(plainToClass(CreateUserDto, user));
    if (errors.length) {
      throw new ValidationError(errors);
    }

    await this.createAndInformUsers({ users: [user] });
    this.logger.log('Admin user created.');
  }
}
