import {
  validate as cvValidate,
  validateSync as cvValidateSync,
  ValidatorOptions,
} from 'class-validator';
import { FILTER_BY_VALIDATE_IF_KEY } from '../../shared/shared.decorators';
import { filterErrorsConstraintsByValidateIfFns } from './class-validator.utils';

export async function validate(object: object, validatorOptions?: ValidatorOptions) {
  const errors = await cvValidate(object, validatorOptions);

  const filterByValidateIfFns =
    Reflect.getMetadata(FILTER_BY_VALIDATE_IF_KEY, object.constructor) ?? false;

  if (filterByValidateIfFns) {
    filterErrorsConstraintsByValidateIfFns(errors);
  }

  return errors;
}

export const validateSync = (object: object, validatorOptions?: ValidatorOptions) => {
  const errors = cvValidateSync(object, validatorOptions);

  const filterByValidateIfFns =
    Reflect.getMetadata(FILTER_BY_VALIDATE_IF_KEY, object.constructor) ?? false;

  if (filterByValidateIfFns) {
    filterErrorsConstraintsByValidateIfFns(errors);
  }

  return errors;
};
