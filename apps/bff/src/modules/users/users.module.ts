import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/db/repositories/user.repository';
import { ValidationException } from '@pcs/shared-data-access';
import { EmailModule } from '../email/email.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [EmailModule, TypeOrmModule.forFeature([UsersRepository])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule implements OnModuleInit {
  constructor(readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.usersService.createAndInformAdminIfNotExists();
    } catch (e) {
      console.error(
        'Failed to create an admin user, please provide ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_FULL_NAME, and ADMIN_PASSWORD environment variables. Failing reason:',
      );
      if (e instanceof ValidationException) {
        console.error(e.errors);
      } else {
        console.error(e);
      }
      process.exit(1);
    }
  }
}
