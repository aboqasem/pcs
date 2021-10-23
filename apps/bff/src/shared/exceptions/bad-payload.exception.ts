import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';
import { TPropsErrors, validationErrorsToPropsErrors } from '@pcs/shared-data-access';

export class BadPayloadException extends HttpException {
  constructor(errors: TPropsErrors | ValidationError[]) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        message: Array.isArray(errors) ? validationErrorsToPropsErrors(errors) : errors,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
