import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { EmailStatus, VERIFIED_EMAIL_KEY } from '../decorators/verified-email.decorator';

@Injectable()
export class SignedInGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.isAuthenticated()) {
      return false;
    }

    const { user } = req;
    const mustBeVerifiedEmail = this.reflector.getAllAndOverride<EmailStatus | undefined>(
      VERIFIED_EMAIL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (mustBeVerifiedEmail === undefined || mustBeVerifiedEmail === EmailStatus.Any) {
      return true;
    }

    if (mustBeVerifiedEmail === EmailStatus.Verified) {
      if (user.isEmailVerified) {
        return true;
      }
      throw new ForbiddenException('Please verify your email');
    }

    if (mustBeVerifiedEmail === EmailStatus.NotVerified) {
      if (!user.isEmailVerified) {
        return true;
      }
      throw new BadRequestException('Your email has been already verified');
    }

    return false;
  }
}
