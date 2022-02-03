import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsPositive,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateBy,
  ValidateIf,
} from 'class-validator';
import { IsValidDate } from '../shared/shared.decorators';
import { TCustomValidationArguments } from '../validation/validation.types';
import { Material } from './materials.classes';
import { MaterialStatus, MaterialType } from './materials.types';

export function IsMaterialId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsUUID()(target, propertyKey);
  };
}

export function IsMaterialTitle(): PropertyDecorator {
  return function (target, propertyKey) {
    Length(5, 50)(target, propertyKey);
  };
}

export function IsMaterialDescription(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value }) => (value === '' ? null : value))(target, propertyKey);

    IsOptional()(target, propertyKey);

    Length(5, 255)(target, propertyKey);
  };
}

export function IsMaterialType(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(MaterialType)(target, propertyKey);
  };
}

export function IsMaterialStatus(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(MaterialStatus)(target, propertyKey);
  };
}

export function IsMaterialBeginsAt(): PropertyDecorator {
  return function (target, propertyKey) {
    IsValidDate()(target, propertyKey);
  };
}

export function IsMaterialEndsAt(): PropertyDecorator {
  return function (target, propertyKey) {
    // only tutorials and assignments will have an end date
    ValidateIf((m: Material) => [MaterialType.Tutorial, MaterialType.Assignment].includes(m.type))(
      target,
      propertyKey,
    );

    Transform(({ value, obj }) =>
      [MaterialType.Tutorial, MaterialType.Assignment].includes((obj as Material).type)
        ? value
        : null,
    )(target, propertyKey);

    IsValidDate()(target, propertyKey);

    ValidateBy(
      {
        name: 'isMaterialEndsAtBeforeMaterialBeginsAt',
        validator: {
          validate: (
            endsAtValue: unknown,
            args: TCustomValidationArguments<Material, 'endsAt'>,
          ) => {
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

export function IsMaterialTotalMark(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value }) => (value === '' ? 0 : value))(target, propertyKey);

    Type(() => Number)(target, propertyKey);

    Min(0)(target, propertyKey);

    // numeric(6, 2)'s max value is 9999.99
    Max(9999.99)(target, propertyKey);
  };
}

export function IsMaterialTotalDuration(): PropertyDecorator {
  return function (target, propertyKey) {
    ValidateIf((m: Material) =>
      // only tutorials and quizzes will have a duration
      [MaterialType.Tutorial, MaterialType.Quiz].includes(m.type),
    )(target, propertyKey);

    Transform(({ value, obj }) =>
      [MaterialType.Tutorial, MaterialType.Quiz].includes((obj as Material).type) ? value : null,
    )(target, propertyKey);

    Type(() => Number)(target, propertyKey);

    IsPositive()(target, propertyKey);

    // smallint's max value is 32767
    Max(32767)(target, propertyKey);
  };
}
