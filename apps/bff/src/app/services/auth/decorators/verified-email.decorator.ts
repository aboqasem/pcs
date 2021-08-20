import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const VERIFIED_EMAIL_KEY = 'VERIFIED_EMAIL';

export enum EmailStatus {
  Any = 'ANY',
  Verified = 'VERIFIED',
  NotVerified = 'NOT_VERIFIED',
}

export const VerifiedEmail = (
  mustBeVerifiedEmail = EmailStatus.Verified,
): CustomDecorator<string> => SetMetadata(VERIFIED_EMAIL_KEY, mustBeVerifiedEmail);
