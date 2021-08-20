import { Type } from '@aboqasem/mapped-types';
import {
  flatErrorsToPropsErrors,
  PropsErrors,
  validationErrorsToFlatErrors,
} from '@myplatform/shared-data-access';
import { plainToClass } from 'class-transformer';
import { validate, validateSync, ValidatorOptions } from 'class-validator';
import { useCallback, useState } from 'react';

export function useValidated<T extends { [K in keyof T]: T[K] }>(cls: Type<T>, plain: T) {
  const [errors, setErrors] = useState<PropsErrors<T>>();
  const [data, setData] = useState(plain);

  const validateData = useCallback(
    async (validatorOptions?: ValidatorOptions) => {
      const transformedData = plainToClass(cls, data);
      const validationErrors = await validate(transformedData, validatorOptions);
      if (validationErrors.length === 0) {
        setErrors(undefined);
        return true;
      }
      const flatErrors = validationErrorsToFlatErrors(validationErrors);
      setErrors(flatErrorsToPropsErrors(flatErrors));
      return false;
    },
    [cls, data],
  );

  const validateDataSync = useCallback(
    (validatorOptions?: ValidatorOptions) => {
      const transformedData = plainToClass(cls, data);
      const validationErrors = validateSync(transformedData, validatorOptions);
      if (validationErrors.length === 0) {
        setErrors(undefined);
        return true;
      }
      const flatErrors = validationErrorsToFlatErrors(validationErrors);
      setErrors(flatErrorsToPropsErrors(flatErrors));
      return false;
    },
    [cls, data],
  );

  return {
    setData,
    data,
    validateData,
    validateDataSync,
    errors,
    setErrors: (flatErrors: string[] | undefined) => {
      setErrors(flatErrors && flatErrorsToPropsErrors(flatErrors));
    },
  };
}
