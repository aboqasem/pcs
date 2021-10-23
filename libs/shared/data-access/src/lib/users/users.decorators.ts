import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { TCustomValidationOptions } from '../validation/validation.types';
import { UserRole } from './users.types';

export function IsUserId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsNumber()(target, propertyKey);
  };
}

export function IsUserUsername<Target = any>(
  validationOptions?: TCustomValidationOptions<Target>,
): PropertyDecorator {
  return function (target, propertyKey) {
    Length(3, 15, validationOptions)(target, propertyKey);

    Matches(/^[a-zA-Z0-9._]*$/, {
      ...validationOptions,
      message:
        '$property may only consist of Latin letters (A to Z), Arabic numerals (0 to 9), and special characters (._)',
    })(target, propertyKey);

    Matches(/^(?!.+[_.]{2,}.+).*$/, {
      ...validationOptions,
      message: '$property should not contain subsequent special characters',
    })(target, propertyKey);

    Matches(/^(?!^[._]+.*)(?!.*[._]+$).*$/, {
      ...validationOptions,
      message: '$property should not start nor end with a special character',
    })(target, propertyKey);
  };
}

export function IsUserEmail<Target = any>(
  validationOptions?: TCustomValidationOptions<Target>,
): PropertyDecorator {
  return function (target, propertyKey) {
    IsEmail({}, validationOptions)(target, propertyKey);
  };
}

export function IsUserUsernameOrEmail(): PropertyDecorator {
  return function (target, propertyKey) {
    IsUserUsername({ context: { enabled: (t, p) => !t[p]?.includes('@') } })(target, propertyKey);

    IsUserEmail({ context: { enabled: (t, p) => t[p]?.includes('@') } })(target, propertyKey);
  };
}

export function IsUserFullName(): PropertyDecorator {
  return function (target, propertyKey) {
    Length(5, 255)(target, propertyKey);

    Matches(/^[A-Za-z\-.' ]*$/, {
      message: "$property may only consist of Latin letters (A to Z) and punctuation marks ('-.)",
    })(target, propertyKey);

    Matches(/^(?!.+[-.']{2,}.+)(?!.+[ ]{2,}.+).*$/, {
      message: '$property should not contain subsequent punctuation marks or spaces',
    })(target, propertyKey);

    Matches(/^(?!^[-.' ]+.*)(?!.*[-.' ]+$).*$/, {
      message: '$property should not start nor end with a punctuation mark or space',
    })(target, propertyKey);

    IsNotEmpty()(target, propertyKey);
  };
}

export function IsUserRole(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(UserRole)(target, propertyKey);
  };
}

export function IsUserPassword(): PropertyDecorator {
  return function (target, propertyKey) {
    MinLength(8)(target, propertyKey);

    IsString()(target, propertyKey);
  };
}
