import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '@pcs/shared-data-access';
import { SignedInGuard } from 'src/modules/auth/guards/signed-in.guard';

export const USER_ROLES_KEY = 'USER_ROLES';

export const UserAuth = ({
  roles = 'ANY',
}: {
  roles?: UserRole[] | 'ANY';
} = {}): ReturnType<typeof applyDecorators> => {
  return applyDecorators(UseGuards(SignedInGuard), SetMetadata(USER_ROLES_KEY, roles));
};
