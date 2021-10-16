import { ValidationOptions } from 'class-validator';
import { Path } from 'react-hook-form';

export type TPropsErrors<TSchema extends Record<string, any> = Record<string, any>> = {
  [K in Path<TSchema>]?: { message?: string };
};

export type TConstraintEnabledFn<TTarget = any> = (
  target: TTarget,
  property: keyof TTarget,
) => boolean;

export type TCustomValidationOptions<TTarget = any> = Omit<ValidationOptions, 'context'> & {
  context: Record<string, any> & {
    /**
     * We added this to enable and enable validation decorators individually.
     */
    enabled?: TConstraintEnabledFn<TTarget>;
  };
};
