import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';
import { TPropsErrors, validationErrorsToPropsErrors } from '@pcs/shared-data-access';

export class BadPayloadException<TSchema> extends HttpException {
  constructor(errors: TPropsErrors<TSchema> | ValidationError[]) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        message: Array.isArray(errors) ? validationErrorsToPropsErrors<TSchema>(errors) : errors,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
