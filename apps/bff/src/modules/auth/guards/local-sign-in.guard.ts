import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ensureAuthenticated } from 'src/modules/auth/guards/auth-guards.utils';

@Injectable()
export class LocalSignInGuard extends AuthGuard('local') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = (await super.canActivate(context)) as boolean;

    const req = context.switchToHttp().getRequest<Request>();

    await super.logIn(req);

    return canActivate && ensureAuthenticated(context, this.reflector);
  }
}
