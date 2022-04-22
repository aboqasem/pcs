import { ValidationError } from 'class-validator';
import { TConstraintEnabledFn } from '../validation.types';

export function filterDisabledErrorsConstraints(errors: ValidationError[]): void {
  emptyErrorsFromDisabledConstraints(errors);
  filterEmptyErrors(errors);
}

function emptyErrorsFromDisabledConstraints(errors: ValidationError[]): void {
  errors.forEach((e) => {
    if (e.children) {
      emptyErrorsFromDisabledConstraints(e.children);
    }
    const constraintKeys = Object.keys(e.constraints ?? {});

    if (constraintKeys.length) {
      constraintKeys.forEach((key) => {
        const enabledFn: TConstraintEnabledFn | undefined = e.contexts?.[key]?.enabled;
        if (enabledFn && typeof enabledFn === 'function' && e.target) {
          if (!enabledFn(e.target, e.property)) {
            delete e.constraints![key];
          }
        }
      });
    }
  });
}

function filterEmptyErrors(errors: ValidationError[] = []): void {
  for (let i = errors.length - 1; i >= 0; --i) {
    const e = errors[i]!;
    if (e.children) {
      filterEmptyErrors(e.children);
    }

    if (isEmptyValidationError(e)) {
      errors.splice(i, 1);
    }
  }
}

function isEmptyValidationError(error: ValidationError) {
  const hasChildren = error.children && error.children.length > 0;

  let hasConstraints = false;
  for (const _ in error.constraints) {
    hasConstraints = true;
    break;
  }

  return !hasChildren && !hasConstraints;
}
