import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@pcs/shared-data-access';
import { Request } from 'express';
import { USER_ROLES_KEY } from 'src/modules/auth/decorators/user-auth.decorator';

export function ensureAuthenticated(context: ExecutionContext, reflector: Reflector): boolean {
  const req = context.switchToHttp().getRequest<Request>();

  if (!req.isAuthenticated()) {
    return false;
  }

  const { user } = req;

  const requiredRoles =
    reflector.getAllAndOverride<UserRole[] | 'ANY' | undefined>(USER_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? /* any user role can access by default */ 'ANY';

  if (requiredRoles === 'ANY') {
    return true;
  }

  return requiredRoles.includes(user.role);
}
