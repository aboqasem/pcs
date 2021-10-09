import { ArgumentMetadata, HttpStatus, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { validate } from '@pcs/shared-data-access';
import {
  ClassConstructor,
  classToPlain,
  ClassTransformOptions,
  plainToClass,
} from 'class-transformer';
import { ValidationError, ValidatorOptions } from 'class-validator';
import { BadPayloadException } from 'src/shared/exceptions/bad-payload.exception';

const isNil = (obj: any): obj is null | undefined => obj === undefined || obj === null;

export interface IValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  transformOptions?: ClassTransformOptions;
  errorHttpStatusCode?: ErrorHttpStatusCode;
  validateCustomDecorators?: boolean;
  expectedType?: ClassConstructor<any>;
}

/**
 * NestJS' validation pipe with custom checking for decorator contexts.
 *
 * https://github.dev/nestjs/nest/blob/90ebd6825754fbd9d007ed3b873da782c75e9be7/packages/common/pipes/validation.pipe.ts
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  protected isTransformEnabled: boolean;
  protected isDetailedOutputDisabled?: boolean;
  protected validatorOptions: ValidatorOptions;
  protected transformOptions: ClassTransformOptions;
  protected errorHttpStatusCode: ErrorHttpStatusCode;
  protected expectedType: ClassConstructor<any>;
  protected validateCustomDecorators: boolean;

  constructor(@Optional() options: IValidationPipeOptions = {}) {
    const {
      transform,
      disableErrorMessages,
      transformOptions,
      errorHttpStatusCode,
      validateCustomDecorators,
      expectedType,
      ...validatorOptions
    } = options;

    this.isTransformEnabled = !!transform;
    this.validatorOptions = validatorOptions;
    this.transformOptions = transformOptions!;
    this.isDetailedOutputDisabled = disableErrorMessages;
    this.validateCustomDecorators = validateCustomDecorators || false;
    this.errorHttpStatusCode = errorHttpStatusCode || HttpStatus.BAD_REQUEST;
    this.expectedType = expectedType!;
  }

  public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (this.expectedType) {
      metadata = { ...metadata, metatype: this.expectedType };
    }

    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metadata)) {
      return this.isTransformEnabled ? this.transformPrimitive(value, metadata) : value;
    }
    const originalValue = value;
    value = this.toEmptyIfNil(value);

    const isOriginalValueNil = value !== originalValue;
    const isPrimitive = this.isPrimitive(value);
    this.stripProtoKeys(value);
    let entity = plainToClass(metatype, value, this.transformOptions);

    const originalEntity = entity;
    const isCtorNotEqual = entity.constructor !== metatype;

    if (isCtorNotEqual && !isPrimitive) {
      entity.constructor = metatype;
    } else if (isCtorNotEqual) {
      // when "entity" is a primitive value, we have to temporarily
      // replace the entity to perform the validation against the original
      // metatype defined inside the handler
      entity = { constructor: metatype };
    }

    const errors = await validate(entity, this.validatorOptions);
    if (errors.length > 0) {
      throw await this.exceptionFactory(errors);
    }
    if (isPrimitive) {
      // if the value is a primitive value and the validation process has been successfully completed
      // we have to revert the original value passed through the pipe
      entity = originalEntity;
    }
    if (this.isTransformEnabled) {
      return entity;
    }
    if (isOriginalValueNil) {
      // if the value was originally undefined or null, revert it back
      return originalValue;
    }
    return Object.keys(this.validatorOptions).length > 0
      ? classToPlain(entity, this.transformOptions)
      : value;
  }

  protected toValidate(metadata: ArgumentMetadata): boolean {
    const { metatype, type } = metadata;
    if (type === 'custom' && !this.validateCustomDecorators) {
      return false;
    }
    const types = [String, Boolean, Number, Array, Object, Buffer];
    return !types.some((t) => metatype === t) && !isNil(metatype);
  }

  protected transformPrimitive(value: any, metadata: ArgumentMetadata): any {
    if (!metadata.data) {
      // leave top-level query/param objects unmodified
      return value;
    }
    const { type, metatype } = metadata;
    if (type !== 'param' && type !== 'query') {
      return value;
    }
    if (metatype === Boolean) {
      return value === true || value === 'true';
    }
    if (metatype === Number) {
      return +value;
    }
    return value;
  }

  protected toEmptyIfNil<T = any, R = any>(value: T): R | Record<string, never> {
    return isNil(value) ? {} : value;
  }

  protected stripProtoKeys(value: Record<string, any>): void {
    delete value.__proto__;
    const keys = Object.keys(value);
    keys
      .filter((key) => typeof value[key] === 'object' && value[key])
      .forEach((key) => this.stripProtoKeys(value[key]));
  }

  protected isPrimitive(value: unknown): boolean {
    return ['number', 'boolean', 'string'].includes(typeof value);
  }

  protected exceptionFactory(errors: ValidationError[]): Promise<Error> | Error {
    return new BadPayloadException(errors);
  }
}
