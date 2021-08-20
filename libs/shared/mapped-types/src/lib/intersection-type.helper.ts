import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { MappedType, Type } from './types';

export function IntersectionType<A, B>(target: Type<A>, source: Type<B>): MappedType<A & B>;

export function IntersectionType<A, B, C>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
): MappedType<A & B & C>;

export function IntersectionType<A, B, C, D>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
  sourceD: Type<D>,
): MappedType<A & B & C & D>;

export function IntersectionType<A, B, C, D, E>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
  sourceD: Type<D>,
  sourceE: Type<E>,
): MappedType<A & B & C & D & E>;

export function IntersectionType<A, B, C, D, E, F>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
  sourceD: Type<D>,
  sourceE: Type<E>,
  sourceF: Type<F>,
): MappedType<A & B & C & D & E & F>;

export function IntersectionType<A, B, C, D, E, F, G>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
  sourceD: Type<D>,
  sourceE: Type<E>,
  sourceF: Type<F>,
  sourceG: Type<G>,
): MappedType<A & B & C & D & E & F & G>;

export function IntersectionType<A, T extends Type[]>(
  classA: Type<A>,
  ...classRefs: T
): MappedType<A> {
  const allClassRefs = [classA, ...classRefs];

  abstract class IntersectionClassType {
    constructor() {
      allClassRefs.forEach((classRef) => {
        inheritPropertyInitializers(this, classRef);
      });
    }
  }

  allClassRefs.forEach((classRef) => {
    inheritValidationMetadata(classRef, IntersectionClassType);
    inheritTransformationMetadata(classRef, IntersectionClassType);
  });

  const intersectedNames = allClassRefs.reduce((prev, ref) => prev + ref.name, '');

  Object.defineProperty(IntersectionClassType, 'name', {
    value: `Intersection${intersectedNames}`,
  });

  return IntersectionClassType as MappedType<A>;
}
