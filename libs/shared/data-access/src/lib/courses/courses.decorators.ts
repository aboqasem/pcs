import { Transform } from 'class-transformer';
import { IsOptional, IsUUID, Length, ValidateBy } from 'class-validator';
import { IsValidDate } from '../shared/shared.decorators';
import {
  TCustomValidationArguments,
  TCustomValidationOptions,
} from '../validation/validation.types';
import { Course } from './courses.classes';

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

    ValidateBy(
      {
        name: 'isCourseEndsAtBeforeCourseBeginsAt',
        validator: {
          validate: (endsAtValue: unknown, args: TCustomValidationArguments<Course, 'endsAt'>) => {
            if (!(endsAtValue instanceof Date) || !(args.object.beginsAt instanceof Date)) {
              return false;
            }

            return endsAtValue > args.object.beginsAt;
          },
        },
      },
      { message: '$property should be after begin date' },
    )(target, propertyKey);
  };
}
