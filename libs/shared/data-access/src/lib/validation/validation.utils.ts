import { capitalize, firstWord, TPropsErrors, withoutFirstWord } from '@pcs/shared-data-access';
import { isNotEmptyObject, ValidationError } from 'class-validator';
import { iterate } from 'iterare';
import { Path } from 'react-hook-form';

export function validationErrorsToPropsErrors<T extends Record<string, any> = Record<string, any>>(
  validationErrors: ValidationError[],
): TPropsErrors<T> {
  return iterate(validationErrors)
    .map((error) => mapChildrenToValidationErrors(error))
    .flatten()
    .filter((error) => isNotEmptyObject(error.constraints))
    .map((error) => Object.values(error.constraints!))
    .flatten()
    .toArray()
    .reduce((propsErrors, errorConstraint) => {
      const property = firstWord(errorConstraint) as Path<T>;
      const constraint = capitalize(withoutFirstWord(errorConstraint));
      if (propsErrors[property]) {
        propsErrors[property]!.message = `${propsErrors[property]}\n${constraint}`;
      } else {
        propsErrors[property] = { message: constraint };
      }
      return propsErrors;
    }, {} as TPropsErrors<T>);
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
