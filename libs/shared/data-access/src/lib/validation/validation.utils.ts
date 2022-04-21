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
      const [pathToError, constraint] = [
        firstWord(errorConstraint),
        withoutFirstWord(errorConstraint),
      ];
      const pathParts = pathToError.split('.');
      const property = pathParts[pathParts.length - 1]!;

      const errorMessage = convertConstraintToReadableMessage(constraint, property);

      if (propsErrors[pathToError]?.message) {
        propsErrors[pathToError]!.message = `${propsErrors[pathToError]!.message}\n${errorMessage}`;
      } else {
        propsErrors[pathToError] = { message: errorMessage };
      }
      return propsErrors;
    }, {} as TPropsErrors);
}

function mapChildrenToValidationErrors(
  error: ValidationError,
  parentPath?: string,
): ValidationError[] {
  if (!(error.children && error.children.length)) {
    return [prependConstraintsWithParentProp(error)];
  }
  const validationErrors: ValidationError[] = [];
  parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
  for (const child of error.children) {
    if (child.children && child.children.length) {
      validationErrors.push(...mapChildrenToValidationErrors(child, parentPath));
    }
    validationErrors.push(prependConstraintsWithParentProp(child, parentPath));
  }
  return validationErrors;
}

function prependConstraintsWithParentProp(
  error: ValidationError,
  parentPath?: string,
): ValidationError {
  const constraints = {} as any;
  for (const key in error.constraints) {
    constraints[key] = `${parentPath ? `${parentPath}.` : ''}${error.property} ${
      error.constraints[key]
    }`;
  }
  return {
    ...error,
    constraints,
  };
}

/*
 * `ArrayUnique()`: https://github.com/typestack/class-validator/blob/e0ec613d7de9b74e789226b4f19d3754d99c6427/src/decorator/array/ArrayUnique.ts#L38
 * { each: false }: "All ${property}'s elements must" => "All elements must"
 * { each: true }: "each value in All ${property}'s elements must" => "Each value in all elements must"
 *
 * `ValidateNested()`: https://github.com/typestack/class-validator/blob/e0ec613d7de9b74e789226b4f19d3754d99c6427/src/decorator/common/ValidateNested.ts#L13
 * { each: false }: "nested property ${property} must" => "Nested property must"
 * { each: true }: "each value in nested property ${property} must" => "Each value in nested property must"
 *
 * `MaxDate()`: https://github.com/typestack/class-validator/blob/e0ec613d7de9b74e789226b4f19d3754d99c6427/src/decorator/date/MaxDate.ts#L24
 * { each: false }: "maximal allowed date for ${property} is" => "Maximal allowed date is"
 * { each: true }: "maximal allowed date for each value in ${property} is" => "Maximal allowed date for each value is"
 *
 * `MinDate()`: https://github.com/typestack/class-validator/blob/e0ec613d7de9b74e789226b4f19d3754d99c6427/src/decorator/date/MinDate.ts#L24
 * { each: false }: "minimal allowed date for ${property} is" => "Minimal allowed date is"
 * { each: true }: "minimal allowed date for each value in ${property} is" => "Minimal allowed date for each value is"
 *
 * All other decorators: https://github.com/typestack/class-validator/blob/e0ec613d7de9b74e789226b4f19d3754d99c6427/src/decorator/common/ValidateBy.ts#L18
 * { each: false }: "$property must" => "Must"
 * { each: true }: "each value in $property must" => "Each value must"
 */
function convertConstraintToReadableMessage(constraint: string, property: string): string {
  return capitalize(
    constraint.replace(
      RegExp(
        `^((?:(?:maximal|minimal) allowed date for )?each value in (?:All |nested property )?|All |nested property |(?:maximal|minimal) allowed date for )?${property}(?:'s | )?`,
      ),
      (_match, p1) => p1?.replace(/(?:in|for) $/, '').toLowerCase() ?? '',
    ),
  );
}
