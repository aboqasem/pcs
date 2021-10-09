import { validate, validationErrorsToPropsErrors } from '@pcs/shared-data-access';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isNotEmptyObject } from 'class-validator';
import { useCallback } from 'react';
import { ResolverError, ResolverResult } from 'react-hook-form';

export function useValidationResolver<T extends { [K in keyof T]: T[K] }>(
  schema: ClassConstructor<T>,
) {
  return useCallback(
    async (object: T): Promise<ResolverResult<T>> => {
      const values = plainToClass(schema, object);
      const errors = validationErrorsToPropsErrors<T>(
        await validate(values),
      ) as ResolverError<T>['errors'];

      if (isNotEmptyObject(errors)) {
        return {
          values: {},
          errors,
        };
      }

      return {
        values,
        errors: {},
      };
    },
    [schema],
  );
}
