import { ValidationError as cvValidationError } from 'class-validator';
import { HttpError } from '../shared/shared.errors';
import { TPropsErrors } from './validation.types';
import { validationErrorsToPropsErrors } from './validation.utils';

export class ValidationError extends HttpError {
  readonly errors: TPropsErrors;

  constructor(errors: TPropsErrors | cvValidationError[], status = 400) {
    super('Validation Error', status);
    this.name = 'ValidationError';

    if (Array.isArray(errors)) {
      this.errors = validationErrorsToPropsErrors(errors);
    } else {
      this.errors = errors;
    }
  }
}
