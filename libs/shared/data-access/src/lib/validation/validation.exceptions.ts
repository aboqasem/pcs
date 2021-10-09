import { ValidationError } from 'class-validator';
import { TPropsErrors } from '../validation/validation.types';
import { validationErrorsToPropsErrors } from './validation.utils';

export class ValidationException<
  TSchema extends Record<string, any> = Record<string, any>,
> extends Error {
  readonly errors: TPropsErrors<TSchema>;

  constructor(errors: TPropsErrors<TSchema> | ValidationError[]) {
    super();
    this.name = 'ValidationException';

    if (Array.isArray(errors)) {
      this.errors = validationErrorsToPropsErrors<TSchema>(errors);
    } else {
      this.errors = errors;
    }
  }
}
