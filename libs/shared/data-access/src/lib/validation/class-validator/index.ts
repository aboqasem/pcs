import {
  validate as cvValidate,
  validateSync as cvValidateSync,
  ValidatorOptions,
} from 'class-validator';
import { FILTER_DISABLED_CONSTRAINTS_KEY } from '../validation.decorators';
import { filterDisabledErrorsConstraints } from './class-validator.utils';

export async function validate(object: object, validatorOptions?: ValidatorOptions) {
  const errors = await cvValidate(object, validatorOptions);

  const filterDisabledConstraintsFns =
    Reflect.getMetadata(FILTER_DISABLED_CONSTRAINTS_KEY, object.constructor) ?? false;

  if (filterDisabledConstraintsFns) {
    filterDisabledErrorsConstraints(errors);
  }

  return errors;
}

export const validateSync = (object: object, validatorOptions?: ValidatorOptions) => {
  const errors = cvValidateSync(object, validatorOptions);

  const filterDisabledConstraintsFns =
    Reflect.getMetadata(FILTER_DISABLED_CONSTRAINTS_KEY, object.constructor) ?? false;

  if (filterDisabledConstraintsFns) {
    filterDisabledErrorsConstraints(errors);
  }

  return errors;
};
