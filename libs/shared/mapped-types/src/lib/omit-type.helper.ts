import { ClassConstructor } from 'class-transformer/types/interfaces';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { TMappedType } from './types';

export function OmitType<T, K extends keyof T>(
  classRef: ClassConstructor<T>,
  keys: readonly K[],
): TMappedType<Omit<T, typeof keys[number]>> {
  const isInheritedPredicate = (propertyKey: string) => !keys.includes(propertyKey as K);

  abstract class OmitClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }

  inheritValidationMetadata(classRef, OmitClassType, isInheritedPredicate);
  inheritTransformationMetadata(classRef, OmitClassType, isInheritedPredicate);

  return OmitClassType as TMappedType<Omit<T, typeof keys[number]>>;
}
