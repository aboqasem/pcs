import { ValidationArguments, ValidationOptions } from 'class-validator';
import { TReplace } from '../shared/shared.types';

export type TPropsErrors = {
  [k: string]: { message?: string } | undefined;
};

export type TConstraintEnabledFn<TTarget = any> = (
  target: { [K in keyof TTarget]?: unknown },
  property: Exclude<keyof TTarget, symbol>,
) => boolean;

export type TCustomValidationOptions<TTarget = any> = TReplace<
  ValidationOptions,
  {
    context: Record<string, any> & {
      /**
       * We added this to disable and enable validation decorators individually.
       */
      enabled?: TConstraintEnabledFn<TTarget>;
    };
  }
>;

export type TCustomValidationArguments<
  TObject extends { [K in keyof TObject]: TObject[K] } = {},
  TProperty extends keyof TObject = keyof TObject,
> = TReplace<
  ValidationArguments,
  {
    /**
     * Object that is being validated.
     */
    object: { [K in keyof TObject]?: unknown };

    /**
     * Name of the object's property being validated.
     */
    property: TProperty;
  }
>;
