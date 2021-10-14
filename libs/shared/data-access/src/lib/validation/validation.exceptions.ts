import { ValidationError } from 'class-validator';
import { HttpException } from '../shared/shared.exceptions';
import { TPropsErrors } from '../validation/validation.types';
import { validationErrorsToPropsErrors } from './validation.utils';

export class ValidationException<
  TSchema extends Record<string, any> = Record<string, any>,
> extends HttpException {
  readonly errors: TPropsErrors<TSchema>;

  constructor(errors: TPropsErrors<TSchema> | ValidationError[], status?: number) {
    super('Validation Error', status);
    this.name = 'ValidationException';

    if (Array.isArray(errors)) {
      this.errors = validationErrorsToPropsErrors<TSchema>(errors);
    } else {
      this.errors = errors;
    }
  }
}
