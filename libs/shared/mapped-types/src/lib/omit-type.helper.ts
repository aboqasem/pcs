import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { MappedType, Type } from './types';

export function OmitType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[],
): MappedType<Omit<T, typeof keys[number]>> {
  const isInheritedPredicate = (propertyKey: string) => !keys.includes(propertyKey as K);

  abstract class OmitClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }

  inheritValidationMetadata(classRef, OmitClassType, isInheritedPredicate);
  inheritTransformationMetadata(classRef, OmitClassType, isInheritedPredicate);

  return OmitClassType as MappedType<Omit<T, typeof keys[number]>>;
}
