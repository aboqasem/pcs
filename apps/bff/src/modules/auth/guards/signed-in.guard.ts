import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ensureAuthenticated } from 'src/modules/auth/guards/auth-guards.utils';

@Injectable()
export class SignedInGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return ensureAuthenticated(context, this.reflector);
  }
}
