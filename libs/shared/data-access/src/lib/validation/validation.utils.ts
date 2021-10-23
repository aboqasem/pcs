import { isNotEmptyObject, ValidationError } from 'class-validator';
import { iterate } from 'iterare';
import { capitalize, firstWord, withoutFirstWord } from '../shared/string.utils';
import { TPropsErrors } from '../validation/validation.types';

export function validationErrorsToPropsErrors(validationErrors: ValidationError[]): TPropsErrors {
  return iterate(validationErrors)
    .map((error) => mapChildrenToValidationErrors(error))
    .flatten()
    .filter((error) => isNotEmptyObject(error.constraints))
    .map((error) => Object.values(error.constraints!))
    .flatten()
    .toArray()
    .reduce((propsErrors, errorConstraint) => {
      const property = firstWord(errorConstraint);
      const constraint = capitalize(withoutFirstWord(errorConstraint));
      if (propsErrors[property]?.message) {
        propsErrors[property]!.message = `${propsErrors[property]!.message}\n${constraint}`;
      } else {
        propsErrors[property] = { message: constraint };
      }
      return propsErrors;
    }, {} as TPropsErrors);
}

function mapChildrenToValidationErrors(
  error: ValidationError,
  parentPath?: string,
): ValidationError[] {
  if (!(error.children && error.children.length)) {
    return [error];
  }
  const validationErrors: ValidationError[] = [];
  parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
  for (const child of error.children) {
    if (child.children && child.children.length) {
      validationErrors.push(...mapChildrenToValidationErrors(child, parentPath));
    }
    validationErrors.push(prependConstraintsWithParentProp(parentPath, child));
  }
  return validationErrors;
}

function prependConstraintsWithParentProp(
  parentPath: string,
  error: ValidationError,
): ValidationError {
  const constraints = {} as any;
  for (const key in error.constraints) {
    constraints[key] = `${parentPath}.${error.constraints[key]}`;
  }
  return {
    ...error,
    constraints,
  };
}
