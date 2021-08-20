import { ValidationError } from 'class-validator';
import { PropsErrors } from './types';

export function firstWord(str: string) {
  const spaceIdx = str.indexOf(' ');
  return spaceIdx === -1 ? str : str.substring(0, spaceIdx);
}

export function withoutFirstWord(str: string) {
  const spaceIdx = str.indexOf(' ');
  return spaceIdx === -1 ? '' : str.substring(spaceIdx + 1);
}

export function upperFirstLetter(str: string) {
  return `${str[0].toUpperCase()}${str.substring(1)}`;
}

export function validationErrorsToFlatErrors(validationErrors: ValidationError[]): string[] {
  return validationErrors.reduce((flatErrors, validationError) => {
    const errors = Object.values(validationError.constraints ?? {});
    flatErrors.push(...errors);
    return flatErrors;
  }, [] as string[]);
}

export function flatErrorsToPropsErrors<T>(flatErrors: string[]): PropsErrors<T> {
  return flatErrors.reduce((newPropsErrorMessages, error) => {
    const property = firstWord(error) as keyof T;
    const errorMessage = upperFirstLetter(withoutFirstWord(error));

    if (newPropsErrorMessages[property]) {
      newPropsErrorMessages[property]!.push(errorMessage);
    } else {
      newPropsErrorMessages[property] = [errorMessage];
    }

    return newPropsErrorMessages;
  }, {} as PropsErrors<T>);
}
