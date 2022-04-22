import { Injectable } from '@nestjs/common';
import { config } from 'src/config/config';
import { EmailService } from 'src/modules/email/email.service';
import { EmailTemplate } from 'src/modules/email/email.types';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async sendOwnPassword(email: string): Promise<boolean> {
    const user = await this.usersService.getActiveUserByEmail(email, ['fullName', 'password']);

    if (!user) {
      return false;
    }

    this.emailService.send({
      to: email,
      template: EmailTemplate.PasswordRetrieval,
      data: {
        fullName: user.fullName,
        password: user.password!,
        signInUrl: config.APP_SIGN_IN_URL,
      },
    });

    return true;
  }
}
