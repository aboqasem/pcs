import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '@pcs/shared-data-access';
import { SignedInGuard } from 'src/modules/auth/guards/signed-in.guard';

export const ACTIVE_USER_KEY = 'ACTIVE_USER';
export const USER_ROLES_KEY = 'USER_ROLES';

export const UserAuth = ({
  isActive = true,
  roles = 'ANY',
}: {
  isActive?: boolean | 'ANY';
  roles?: UserRole[] | 'ANY';
} = {}): ReturnType<typeof applyDecorators> => {
  return applyDecorators(
    UseGuards(SignedInGuard),
    SetMetadata(ACTIVE_USER_KEY, isActive),
    SetMetadata(USER_ROLES_KEY, roles),
  );
};
