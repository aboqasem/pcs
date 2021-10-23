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
  ValidationException,
} from '@pcs/shared-data-access';
import { plainToClass } from 'class-transformer';
import { config } from 'src/config/config';
import { UserEntity } from 'src/db/entities/user.entity';
import { UsersRepository } from 'src/db/repositories/user.repository';
import { EmailType } from 'src/modules/email/email.types';
import { generateRandomPassword } from 'src/shared/shared.utils';
import { FindConditions } from 'typeorm';
import { EmailService } from '../email/email.service';

type TUserSelect = (keyof UserEntity)[] | undefined;

type TGetUser<TSelect extends TUserSelect> =
  | (TSelect extends (keyof UserEntity)[] ? Pick<UserEntity, TSelect[number]> : UserDto)
  | undefined;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async getAllUsers(conditions?: FindConditions<UserEntity> | undefined): Promise<UserDto[]> {
    return this.usersRepository.find(conditions);
  }

  async getActiveUserById<TSelect extends TUserSelect>(
    id: number,
    select?: TSelect,
  ): Promise<TGetUser<TSelect>> {
    return this.usersRepository.findOne({ id, isActive: true }, { select });
  }

  async getActiveUserByEmail<TSelect extends TUserSelect>(
    email: string,
    select?: TSelect,
  ): Promise<TGetUser<TSelect>> {
    return this.usersRepository.findOne({ email, isActive: true }, { select });
  }

  async getActiveUserByCredentials<TSelect extends TUserSelect>(
    credentials: UserCredentials,
    select?: TSelect,
  ): Promise<TGetUser<TSelect>> {
    select = select ?? (['id', 'email', 'username', 'fullName', 'role', 'isActive'] as TSelect);

    const user = await this.usersRepository.findByUsernameOrEmail(
      credentials.username,
      {
        isActive: true,
      },
      // because we want the password for comparison, we have to select all those fields in UserDto as well as password
      // since the password not selected by default
      { select: [...select!, 'password'] },
    );

    if (user?.password === credentials.password) {
      if (select!.includes('password')) {
        return user;
      }
      return userToUserDto(user) as TGetUser<TSelect>;
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

          throw new ValidationException(usersErrors);
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
        password: user.password,
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
      throw new ValidationException(errors);
    }

    await this.createAndInformUsers({ users: [user] });
    this.logger.log('Admin user created.');
  }
}
