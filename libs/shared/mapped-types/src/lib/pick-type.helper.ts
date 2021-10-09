import { ClassConstructor } from 'class-transformer/types/interfaces';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { TMappedType } from './types';

export function PickType<T, K extends keyof T>(
  classRef: ClassConstructor<T>,
  keys: readonly K[],
): TMappedType<Pick<T, typeof keys[number]>> {
  const isInheritedPredicate = (propertyKey: string) => keys.includes(propertyKey as K);

  abstract class PickClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }
  inheritValidationMetadata(classRef, PickClassType, isInheritedPredicate);
  inheritTransformationMetadata(classRef, PickClassType, isInheritedPredicate);

  return PickClassType as TMappedType<Pick<T, typeof keys[number]>>;
}
