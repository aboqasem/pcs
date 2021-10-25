import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsUUID, Length, registerDecorator } from 'class-validator';
import { Course } from '../courses/courses.classes';
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

export function IsCourseBeginDate(): PropertyDecorator {
  return function (target, propertyKey) {
    Type(() => Date)(target, propertyKey);

    IsDate({ message: '$property must be a valid date' })(target, propertyKey);
  };
}

export function IsCourseEndDate(): PropertyDecorator {
  return function (target, propertyKey) {
    Type(() => Date)(target, propertyKey);

    IsDate({ message: '$property must be a valid date' })(target, propertyKey);

    registerDecorator({
      name: 'isCourseEndDateBeforeCourseBeginDate',
      target: target.constructor,
      options: { message: '$property should be after begin date' },
      propertyName: propertyKey.toString(),
      validator: {
        validate: (endDateValue: any, args: TCustomValidationArguments<Course, 'endDate'>) => {
          if (!(endDateValue instanceof Date)) {
            return false;
          }

          return endDateValue > args.object.beginDate;
        },
      },
    });
  };
}
