import { ValidationError } from 'class-validator';
import { HttpException } from '../shared/shared.exceptions';
import { TPropsErrors } from '../validation/validation.types';
import { validationErrorsToPropsErrors } from './validation.utils';

export class ValidationException extends HttpException {
  readonly errors: TPropsErrors;

  constructor(errors: TPropsErrors | ValidationError[], status?: number) {
    super('Validation Error', status);
    this.name = 'ValidationException';

    if (Array.isArray(errors)) {
      this.errors = validationErrorsToPropsErrors(errors);
    } else {
      this.errors = errors;
    }
  }
}
