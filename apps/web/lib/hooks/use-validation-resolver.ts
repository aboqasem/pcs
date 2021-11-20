import { validate, validationErrorsToPropsErrors } from '@pcs/shared-data-access';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { isNotEmptyObject } from 'class-validator';
import { useCallback } from 'react';
import { FieldErrors, ResolverResult } from 'react-hook-form';

export function useValidationResolver<TSchema extends { [K in keyof TSchema]: TSchema[K] }>(
  schema: ClassConstructor<TSchema>,
) {
  return useCallback(
    async (object: TSchema): Promise<ResolverResult<TSchema>> => {
      const values = plainToInstance(schema, object);
      const errors = validationErrorsToPropsErrors(await validate(values)) as FieldErrors<TSchema>;

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
