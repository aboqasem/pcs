import { Injectable, ValidationPipe } from '@nestjs/common';
import { validate } from '@pcs/shared-data-access';
import { ValidationError } from 'class-validator';
import { BadPayloadException } from 'src/shared/exceptions/bad-payload.exception';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  protected override validate = validate;

  protected override exceptionFactory = (errors: ValidationError[]): Promise<Error> | Error => {
    return new BadPayloadException(errors);
  };
}
