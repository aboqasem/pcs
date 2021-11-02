import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsUUID, Length, registerDecorator } from 'class-validator';
import { Course } from '../courses/courses.classes';
import { IsValidDate } from '../shared/shared.decorators';
import {
  TCustomValidationArguments,
  TCustomValidationOptions,
} from '../validation/validation.types';

export function IsCourseId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsUUID()(target, propertyKey);
  };
}

export function IsCourseTitle<Target = any>(
  validationOptions?: TCustomValidationOptions<Target>,
): PropertyDecorator {
  return function (target, propertyKey) {
    Length(5, 50, validationOptions)(target, propertyKey);
  };
}

export function IsCourseEmail<Target = any>(
  validationOptions?: TCustomValidationOptions<Target>,
): PropertyDecorator {
  return function (target, propertyKey) {
    IsEmail({}, validationOptions)(target, propertyKey);
  };
}

export function IsCourseDescription(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value }) => (value === '' ? null : value))(target, propertyKey);

    IsOptional()(target, propertyKey);

    Length(5, 255)(target, propertyKey);
  };
}

export function IsCourseBeginsAt(): PropertyDecorator {
  return function (target, propertyKey) {
    IsValidDate()(target, propertyKey);
  };
}

export function IsCourseEndsAt(): PropertyDecorator {
  return function (target, propertyKey) {
    IsValidDate()(target, propertyKey);

    registerDecorator({
      name: 'isCourseEndsAtBeforeCourseBeginsAt',
      target: target.constructor,
      options: { message: '$property should be after begin date' },
      propertyName: propertyKey.toString(),
      validator: {
        validate: (endsAtValue: any, args: TCustomValidationArguments<Course, 'endsAt'>) => {
          if (!(endsAtValue instanceof Date)) {
            return false;
          }

          return endsAtValue > args.object.beginsAt;
        },
      },
    });
  };
}
