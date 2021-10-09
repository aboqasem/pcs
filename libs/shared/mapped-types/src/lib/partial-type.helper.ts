import { ClassConstructor } from 'class-transformer/types/interfaces';
import {
  applyIsOptionalDecorator,
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { TMappedType } from './types';

export function PartialType<T>(classRef: ClassConstructor<T>): TMappedType<Partial<T>> {
  abstract class PartialClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef);
    }
  }

  const propertyKeys = inheritValidationMetadata(classRef, PartialClassType);
  inheritTransformationMetadata(classRef, PartialClassType);

  if (propertyKeys) {
    propertyKeys.forEach((key) => {
      applyIsOptionalDecorator(PartialClassType, key);
    });
  }

  Object.defineProperty(PartialClassType, 'name', {
    value: `Partial${classRef.name}`,
  });

  return PartialClassType as TMappedType<Partial<T>>;
}
