import { ValidationOptions } from 'class-validator';

export type TPropsErrors = {
  [k: string]: { message?: string } | undefined;
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
